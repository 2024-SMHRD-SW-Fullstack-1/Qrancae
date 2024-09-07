package com.qrancae.mobile.activity

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Rect
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import com.qrancae.mobile.R
import com.qrancae.mobile.model.LogData
import com.qrancae.mobile.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

class QRCodeScanActivity : AppCompatActivity() {

    private lateinit var fullPreviewView: PreviewView
    private lateinit var cameraExecutor: ExecutorService
    private val aesKey = "qrancae123456789" // 백엔드와 동일한 AES 키
    private var isDetected = false // 플래그 추가
    private var cameraProvider: ProcessCameraProvider? = null // 카메라 프로바이더 변수 추가
    private val TAG = "QRCodeScanActivity"

    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qrcode_scan)

        // Initialize View
        fullPreviewView = findViewById(R.id.fullPreviewView)
        cameraExecutor = Executors.newSingleThreadExecutor()

        if (intent.getBooleanExtra("RESET_SCAN", false)) {
            isDetected = false // Reset QR code detection flag
        }

        // Check Camera Permission
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            fullPreviewView.post { startCamera() } // Start camera when the view is ready
        } else {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 1001)
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()

            // 전체 화면에 카메라 프리뷰 설정
            val fullPreview = Preview.Builder().build().also {
                it.setSurfaceProvider(fullPreviewView.surfaceProvider)
            }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            val imageAnalysis = ImageAnalysis.Builder()
                .setTargetResolution(android.util.Size(1280, 720))
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                if (!isDetected) { // 플래그 확인
                    processImage(imageProxy)
                }
            }

            try {
                cameraProvider?.unbindAll() // 이전 바인딩 해제
                cameraProvider?.bindToLifecycle(this, cameraSelector, fullPreview, imageAnalysis)
            } catch (exc: Exception) {
                Log.e("QRCodeScanActivity", "Use case binding failed", exc)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun calculateBoxRect(): Rect {
        // PreviewView의 크기를 가져옴
        val previewWidth = fullPreviewView.width
        val previewHeight = fullPreviewView.height

        // 중앙 영역의 크기와 위치를 비율로 계산
        val left = (previewWidth * 0.45).toInt()
        val top = (previewHeight * 0.30).toInt()
        val right = (previewWidth * 0.55).toInt()
        val bottom = (previewHeight * 0.35).toInt()

        return Rect(left, top, right, bottom)
    }

    @androidx.annotation.OptIn(ExperimentalGetImage::class)
    private fun processImage(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image ?: return
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

        // 중앙 박스의 크기와 위치를 가져오기
        val boxRect = calculateBoxRect()

        val scanner = BarcodeScanning.getClient()
        scanner.process(image)
            .addOnSuccessListener { barcodes ->
                for (barcode in barcodes) {
                    val boundingBox = barcode.boundingBox
                    if (boundingBox != null && Rect.intersects(boundingBox, boxRect)) {
                        if (!isDetected) { // 플래그 확인
                            isDetected = true // 플래그 설정
                            val encodedValue = barcode.displayValue ?: ""
                            val decodedValue = decodeAndDecrypt(encodedValue)
                            Log.d("QRCodeScanActivity", "Decoded QR Code: $decodedValue")
                            Toast.makeText(this, "QR Code: $decodedValue", Toast.LENGTH_SHORT).show()

                            // QR 데이터에서 userId와 cableIdx를 추출
                            val userId = getLoggedInUserId() // 로그인된 사용자 ID 가져오기
                            val cableIdx = extractCableIdxFromQR(decodedValue)

                            // 케이블 연결 기록 확인 및 저장
                            checkAndSaveCableConnection(userId, cableIdx)
                        }
                    }
                }
            }
            .addOnFailureListener {
                Log.e("QRCodeScanActivity", "Barcode detection failed", it)
            }
            .addOnCompleteListener {
                imageProxy.close()
            }
    }

    private fun getLoggedInUserId(): String {
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val userId = sharedPref.getString("userId", "") ?: ""
        if (userId.isEmpty()) {
            Log.e(TAG, "No user ID found in shared preferences")
        } else {
            Log.d(TAG, "Retrieved userId: $userId")
        }
        return userId
    }

    private fun extractCableIdxFromQR(qrData: String): Long {
        val dataParts = qrData.split(",")
        val cableIdx = dataParts.getOrNull(0)?.toLongOrNull() ?: 0L
        Log.d(TAG, "Extracted cableIdx: $cableIdx")
        return cableIdx
    }

    // 새로운 함수 추가: 케이블 연결 기록 확인 후 저장
    private fun checkAndSaveCableConnection(userId: String, cableIdx: Long) {
        // 케이블 연결 기록이 있는지 서버에 요청하여 확인
        RetrofitClient.apiService.checkCableHistory(cableIdx).enqueue(object : Callback<Boolean> {
            override fun onResponse(call: Call<Boolean>, response: Response<Boolean>) {
                if (response.isSuccessful && response.body() == true) {
                    // 이미 연결 기록이 있으면 QRdetailActivity로 화면 전환
                    saveLog(userId, cableIdx) // 로그 저장 추가
                    moveToQRDetailActivity(cableIdx)
                } else {
                    // 연결 기록이 없으면 설치 기록 저장
                    saveCableInstallation(userId, cableIdx)
                }
            }

            override fun onFailure(call: Call<Boolean>, t: Throwable) {
                Log.e(TAG, "Failed to check cable history: ${t.message}")
            }
        })
    }

    // 포설 날짜를 기록하는 함수
    private fun saveCableInstallation(userId: String, cableIdx: Long) {
        RetrofitClient.apiService.saveCableInstallation(cableIdx, userId).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@QRCodeScanActivity, "케이블 포설 날짜가 저장되었습니다.", Toast.LENGTH_SHORT).show()
                    saveLog(userId, cableIdx) // 로그 저장 추가
                    moveToQRDetailActivity(cableIdx)
                } else {
                    Log.e(TAG, "Error: ${response.errorBody()?.string()}, Response code: ${response.code()}")
                    saveLog(userId, cableIdx) // 로그 저장 추가
                    moveToQRDetailActivity(cableIdx) // 실패했더라도 이동
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Log.e(TAG, "Failed to save cable installation: ${t.message}")
            }
        })
    }

    // 로그 저장 함수 추가
    private fun saveLog(userId: String, cableIdx: Long) {
        val logData = LogData(userId, cableIdx)
        Log.d(TAG, "Sending log to server: userId = $userId, cableIdx = $cableIdx")

        RetrofitClient.apiService.saveLog(logData).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Log.d(TAG, "Log saved successfully on server for cableIdx = $cableIdx")
                } else {
                    Log.e(TAG, "Failed to save log on server. Response code: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Log.e(TAG, "Error saving log on server: ${t.message}")
            }
        })
    }

    // QRdetailActivity로 전환하는 함수
    private fun moveToQRDetailActivity(cableIdx: Long) {
        val intent = Intent(this@QRCodeScanActivity, QRdetailActivity::class.java)
        intent.putExtra("QR_DATA", cableIdx.toString())
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
        cameraProvider?.unbindAll() // 카메라 리소스 해제
    }

    override fun onResume() {
        super.onResume()
        isDetected = false // 플래그 초기화
        if (cameraProvider != null) {
            cameraProvider?.unbindAll() // 기존 카메라 세션 해제
        }
        startCamera() // 카메라 다시 초기화
    }

    override fun onBackPressed() {
        super.onBackPressed() // 기본 동작을 유지합니다.
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
        finish()
    }

    private fun decodeAndDecrypt(encodedString: String): String {
        return try {
            val decodedBytes = Base64.decode(encodedString, Base64.DEFAULT)
            val secretKey = SecretKeySpec(aesKey.toByteArray(Charsets.UTF_8), "AES")
            val cipher = Cipher.getInstance("AES")
            cipher.init(Cipher.DECRYPT_MODE, secretKey)
            val decryptedBytes = cipher.doFinal(decodedBytes)
            String(decryptedBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            Log.e("QRCodeScanActivity", "Decryption failed", e)
            "Decoding failed"
        }
    }
}

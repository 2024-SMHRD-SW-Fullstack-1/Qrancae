package com.qrancae.mobile

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Rect
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.view.View
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
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

                            // 인식된 데이터를 QRdetailActivity로 전달
                            val intent = Intent(this, QRdetailActivity::class.java)
                            intent.putExtra("QR_DATA", decodedValue)
                            startActivity(intent)
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
        finish() // 현재 Activity를 종료
    }

    private fun openClose() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
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

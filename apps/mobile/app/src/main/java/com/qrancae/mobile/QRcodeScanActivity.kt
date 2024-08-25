package com.qrancae.mobile

import android.Manifest
import androidx.core.content.ContextCompat
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.journeyapps.barcodescanner.DecoratedBarcodeView

class QRcodeScanActivity : AppCompatActivity() {

    private val CAMERA_REQUEST_CODE = 100

    private lateinit var barcodeScannerView: DecoratedBarcodeView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qrcode_scan)

        // 카메라 권한이 허용되어 있는지 확인
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // 카메라 권한이 허용되지 않은 경우 권한 요청
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                CAMERA_REQUEST_CODE
            )
        } else {
            // 이미 권한이 허용된 경우 QR 코드 스캐너 시작
            startQRCodeScanner()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_REQUEST_CODE) {
            if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                // 권한이 허용되면 QR 코드 스캐너 시작
                startQRCodeScanner()
            } else {
                // 권한이 거부된 경우
                // 적절한 조치를 취하세요
            }
        }
    }

    private fun startQRCodeScanner() {
        barcodeScannerView = findViewById(R.id.barcode_scanner)
        barcodeScannerView.decodeContinuous { result ->
            // QR 코드 스캔 결과 처리
            runOnUiThread {
                // 결과를 UI에 반영
                Toast.makeText(this, result.text, Toast.LENGTH_LONG).show()
            }
        }
        barcodeScannerView.resume() // 카메라 프리뷰 시작
    }

    override fun onResume() {
        super.onResume()
        barcodeScannerView.resume()
    }

    override fun onPause() {
        super.onPause()
        barcodeScannerView.pause()
    }

}

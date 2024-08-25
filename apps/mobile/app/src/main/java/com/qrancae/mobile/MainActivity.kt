package com.qrancae.mobile

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 카메라 아이콘 클릭 리스너 설정
        val cameraIcon: ImageView = findViewById(R.id.camera_icon)
        cameraIcon.setOnClickListener {
            openQRScanner()
        }
    }

    private fun openQRScanner() {
        val intent = Intent(this, QRcodeScanActivity::class.java)
        startActivity(intent)
    }
}

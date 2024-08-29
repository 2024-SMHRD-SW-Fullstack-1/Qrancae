package com.qrancae.mobile

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import androidx.activity.ComponentActivity
import androidx.cardview.widget.CardView

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 알림 버튼 클릭 리스너 설정
        val alarmbutton : ImageButton = findViewById(R.id.btn_alarm)
        alarmbutton.setOnClickListener{
            openAlarm()
        }

        // 세팅 버튼 클릭 리스너 설정
        val settingbutton : ImageButton = findViewById(R.id.btn_setting)
        settingbutton.setOnClickListener{
            openSetting()
        }

        // 진행 현황 뷰 클릭 리스너 설정
        val maintbutton : CardView = findViewById(R.id.progress_card)
        maintbutton.setOnClickListener{
            openMaint()
        }

        // QR 코드 스캔 버튼 클릭 리스너 설정
        val qrbutton: Button = findViewById(R.id.qr_scan_button)
        qrbutton.setOnClickListener {
            openQRScanner()
        }
    }

    private fun openAlarm() {
        val intent = Intent(this, AlarmListActivity::class.java)
        startActivity(intent)
    }

    private fun openSetting() {
        val intent = Intent(this, SettingActivity::class.java)
        startActivity(intent)
    }

    private fun openMaint() {
        val intent = Intent(this, MaintListActivity::class.java)
        startActivity(intent)
    }

    private fun openQRScanner() {
        val intent = Intent(this, QRCodeScanActivity::class.java)
        startActivity(intent)
    }
}

package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.cardview.widget.CardView
import com.qrancae.mobile.R
import com.qrancae.mobile.model.MaintStatusResponse
import com.qrancae.mobile.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // SharedPreferences에서 userName 불러오기
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val userName = sharedPref.getString("userName", "사용자") // 기본값을 "사용자"로 설정
        val userId = sharedPref.getString("userId", "") // UserId도 불러오기

        val welcomeTextView: TextView = findViewById(R.id.welcome_text)
        welcomeTextView.text = "안녕하세요\n$userName 님!"

        // 유지보수 현황 건수 불러오기
        if (userId != null && userId.isNotEmpty()) {  // 수정된 부분
            loadMaintenanceStatus(userId)
        }

        // 알림 버튼 클릭 리스너 설정
        val alarmbutton: ImageButton = findViewById(R.id.btn_alarm)
        alarmbutton.setOnClickListener {
            openAlarm()
        }

        // 세팅 버튼 클릭 리스너 설정
        val settingbutton: ImageButton = findViewById(R.id.btn_setting)
        settingbutton.setOnClickListener {
            openSetting()
        }

        // 진행 현황 뷰 클릭 리스너 설정
        val maintbutton: CardView = findViewById(R.id.progress_card)
        maintbutton.setOnClickListener {
            openMaint()
        }

        // QR 코드 스캔 버튼 클릭 리스너 설정
        val qrbutton: Button = findViewById(R.id.qr_scan_button)
        qrbutton.setOnClickListener {
            openQRScanner()
        }

        // 로그아웃 버튼 클릭 리스너 설정
        val logoutbutton: TextView = findViewById(R.id.tv_Logout)
        logoutbutton.setOnClickListener {
            logout()
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
        // 메인 화면에서 "신규 접수" 텍스트를 가져와서 숫자만 추출
        val newEntryCountText = findViewById<TextView>(R.id.new_entry_count).text.toString()
        val newEntryCount = newEntryCountText.replace("건","").toIntOrNull() ?: 0

        val intent = Intent(this, MaintListActivity::class.java).apply {
            putExtra("NEW_ENTRY_COUNT", newEntryCount)
        }
        startActivity(intent)
    }

    private fun openQRScanner() {
        val intent = Intent(this, QRCodeScanActivity::class.java)
        startActivity(intent)
    }

    private fun logout() {
        // SharedPreferences 초기화 (사용자 정보 삭제)
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        with(sharedPref.edit()) {
            clear()
            apply()
        }

        // 로그인 페이지로 이동
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)

        //현재 액티비티 종료
        finish()
    }

    private fun loadMaintenanceStatus(userId: String) {
        // 먼저 UI 요소를 초기화
        findViewById<TextView>(R.id.new_entry_count).text = "0건"
        findViewById<TextView>(R.id.in_progress_count).text = "0건"
        findViewById<TextView>(R.id.completed_count).text = "0건"

        // API 호출
        RetrofitClient.apiService.getMaintenanceStatus(userId)
            .enqueue(object : Callback<MaintStatusResponse> {
                override fun onResponse(
                    call: Call<MaintStatusResponse>,
                    response: Response<MaintStatusResponse>
                ) {
                    if (response.isSuccessful) {
                        val status = response.body()
                        if (status != null) {
                            // 받은 데이터를 UI에 반영
                            findViewById<TextView>(R.id.new_entry_count).text =
                                "${status.newEntryCount}건"
                            findViewById<TextView>(R.id.in_progress_count).text =
                                "${status.inProgressCount}건"
                            findViewById<TextView>(R.id.completed_count).text =
                                "${status.completedCount}건"
                        }
                    } else {
                        Log.e("MainActivity", "Failed to load maintenance status: ${response.errorBody()?.string()}")
                    }
                }

                override fun onFailure(call: Call<MaintStatusResponse>, t: Throwable) {
                    Log.e("MainActivity", "Error in fetching maintenance status", t)
                }
            })
    }

}

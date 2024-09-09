package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.cardview.widget.CardView
import com.qrancae.mobile.R
import com.qrancae.mobile.model.MaintStatusResponse
import com.qrancae.mobile.network.RetrofitClient
import com.qrancae.mobile.util.ButtonAnimationUtil
import com.qrancae.mobile.util.TouchEffectUtil
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : ComponentActivity() {

    private val TAG = "MainActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // SharedPreferences에서 userName 불러오기
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val userName = sharedPref.getString("userName", "사용자") // 기본값을 "사용자"로 설정
        val userId = sharedPref.getString("userId", "") // UserId도 불러오기

        Log.d(TAG, "UserName: $userName, UserId: $userId")

        val welcomeTextView: TextView = findViewById(R.id.welcome_text)
        welcomeTextView.text = "안녕하세요\n$userName 님!"

        // 유지보수 현황 건수 불러오기
        if (userId != null && userId.isNotEmpty()) {
            Log.d(TAG, "Loading maintenance status for UserId: $userId")
            loadMaintenanceStatus(userId)
        } else {
            Log.e(TAG, "UserId is null or empty")
        }

        // 알림 버튼 클릭 리스너 설정
        val alarmButton: ImageButton = findViewById(R.id.btn_alarm)
        ButtonAnimationUtil.applyButtonAnimation(alarmButton, this) {
            openAlarm()
        }

        // 진행 현황 뷰 클릭 리스너 설정
        val maintButton: CardView = findViewById(R.id.progress_card)
        TouchEffectUtil.applyTouchEffect(maintButton) {
            openMaint() // 뷰 클릭 시 실행될 동작
        }

        // QR 코드 스캔 버튼 클릭 리스너 설정
        val qrButton: Button = findViewById(R.id.qr_scan_button)
        TouchEffectUtil.applyTouchEffect(qrButton) {
            openQRScanner() // 버튼 클릭 시 실행될 동작
        }

        // 로그아웃 버튼 클릭 리스너 설정
        val logoutButton: TextView = findViewById(R.id.tv_Logout)
        logoutButton.setOnClickListener {
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
        val newEntryCountText = findViewById<TextView>(R.id.new_entry_count).text.toString()
        val newEntryCount = newEntryCountText.replace("건", "").toIntOrNull() ?: 0

        val inProgressCountText = findViewById<TextView>(R.id.in_progress_count).text.toString()
        val inProgressCount = inProgressCountText.replace("건", "").toIntOrNull() ?: 0

        Log.d(TAG, "Opening maintenance list with New Entry Count: $newEntryCount")

        val intent = Intent(this, MaintListActivity::class.java).apply {
            putExtra("NEW_ENTRY_COUNT", newEntryCount)
            putExtra("IN_PROGRESS_COUNT", inProgressCount)
        }
        startActivity(intent)
    }

    private fun openQRScanner() {
        val intent = Intent(this, QRCodeScanActivity::class.java)
        startActivity(intent)
    }

    private fun logout() {
        Log.d(TAG, "Logging out and clearing user data")
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        with(sharedPref.edit()) {
            clear()
            apply()
        }

        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    private fun loadMaintenanceStatus(userId: String) {
        RetrofitClient.apiService.getMaintenanceStatus(userId)
            .enqueue(object : Callback<MaintStatusResponse> {
                override fun onResponse(
                    call: Call<MaintStatusResponse>,
                    response: Response<MaintStatusResponse>
                ) {
                    if (response.isSuccessful) {
                        val status = response.body()
                        if (status != null) {
                            // 건수를 SharedPreferences에 저장
                            val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
                            with(sharedPref.edit()) {
                                putInt("NEW_ENTRY_COUNT", status.newEntryCount)
                                putInt("IN_PROGRESS_COUNT", status.inProgressCount)
                                apply()
                            }
                            // UI 업데이트
                            findViewById<TextView>(R.id.new_entry_count).text = "${status.newEntryCount}건"
                            findViewById<TextView>(R.id.in_progress_count).text = "${status.inProgressCount}건"
                            findViewById<TextView>(R.id.completed_count).text = "${status.completedCount}건"

                            // 아이콘 변경 로직
                            val alarmButton: ImageButton = findViewById(R.id.btn_alarm)
                            if (status.inProgressCount > 0) {
                                alarmButton.setImageResource(R.drawable.ic_notifications_unread)
                            } else {
                                alarmButton.setImageResource(R.drawable.ic_notifications)
                            }
                        }
                    } else {
                        Log.e(TAG, "Failed to load maintenance status: ${response.errorBody()?.string()}")
                    }
                }

                override fun onFailure(call: Call<MaintStatusResponse>, t: Throwable) {
                    Log.e(TAG, "Error in fetching maintenance status", t)
                }
            })
    }

}

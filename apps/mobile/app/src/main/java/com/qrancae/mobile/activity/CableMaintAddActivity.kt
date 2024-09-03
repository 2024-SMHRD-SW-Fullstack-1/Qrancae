package com.qrancae.mobile.activity

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.network.RetrofitClient
import com.qrancae.mobile.model.MaintenanceData
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

class CableMaintAddActivity : AppCompatActivity() {

    private lateinit var btnCable: Button
    private lateinit var btnPower: Button
    private lateinit var btnQr: Button
    private lateinit var btnNoIssues: Button
    private lateinit var editTextMemo: EditText
    private lateinit var checkBoxNewProblem: CheckBox
    private lateinit var btnSubmit: Button
    private lateinit var tvNotice: TextView

    private var maintStatus: String = "신규접수"
    private var cableIdx: Long = 0L
    private var maintIdx: Long = 0L

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cable_maint_add)

        tvNotice = findViewById(R.id.tv_notice)
        cableIdx = getCableIdx()

//        fetchMaintIdxAndCheckForAlarm()

        val currentDate = LocalDateTime.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd(E)", Locale.KOREA)
        val formattedDate = currentDate.format(formatter)
        findViewById<TextView>(R.id.tv_date).text = formattedDate

        btnCable = findViewById(R.id.btn_cable)
        btnPower = findViewById(R.id.btn_power)
        btnQr = findViewById(R.id.btn_qr)
        btnNoIssues = findViewById(R.id.btn_no_issues)
        editTextMemo = findViewById(R.id.editTextText)
        checkBoxNewProblem = findViewById(R.id.checkBox)
        btnSubmit = findViewById(R.id.btn_submit)

        btnCable.setOnClickListener { toggleButtonState(btnCable) }
        btnPower.setOnClickListener { toggleButtonState(btnPower) }
        btnQr.setOnClickListener { toggleButtonState(btnQr) }
        btnNoIssues.setOnClickListener { toggleNoIssuesState() }

        btnSubmit.setOnClickListener { submitMaintenance() }
    }

//    private fun fetchMaintIdxAndCheckForAlarm() {
//        val userId = getUserId()
//
//        RetrofitClient.apiService.getMaintIdx(userId, cableIdx.toInt(), true).enqueue(object : Callback<Int> {
//            override fun onResponse(call: Call<Int>, response: Response<Int>) {
//                if (response.isSuccessful) {
//                    maintIdx = response.body()?.toLong() ?: 0L
//                    if (maintIdx != 0L) {
//                        Log.d("CableMaintAddActivity", "유지보수 ID : $maintIdx")
//                        checkForAdminAlarm()
//                    } else {
//                        Log.d("CableMaintAddActivity", "유지보수 ID를 찾지 못했습니다.")
//                    }
//                } else {
//                    Log.e("CableMaintAddActivity", "유지보수 ID 가져오기 실패: ${response.errorBody()?.string()}")
//                    tvNotice.text = "유지보수 ID를 가져오지 못했습니다."
//                }
//            }
//
//            override fun onFailure(call: Call<Int>, t: Throwable) {
//                Log.e("CableMaintAddActivity", "유지보수 ID 가져오기 실패", t)
//                tvNotice.text = "유지보수 ID 가져오기 실패"
//            }
//        })
//    }

    private fun toggleButtonState(button: Button) {
        val isChecked = button.tag as? Boolean ?: false
        button.tag = !isChecked

        if (!isChecked) {
            button.setBackgroundResource(R.drawable.rounded_button_checked)
            button.setTextColor(Color.parseColor("#FFFFFF"))
            button.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check_white, 0, 0, 0)
        } else {
            button.setBackgroundResource(R.drawable.rounded_button_check)
            button.setTextColor(Color.parseColor("#A5A5A5"))
            button.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
        }

        // 만약 버튼이 처음 눌렸을 때 기본값으로 초기화되지 않았다면 여기에 기본값 설정 코드 추가
        if (button.tag == null) {
            button.tag = false
        }

        validateSelection()
    }


    private fun toggleNoIssuesState() {
        val isChecked = btnNoIssues.tag as? Boolean ?: false
        if (!isChecked) {
            deselectAllIssues()
            btnNoIssues.setBackgroundResource(R.drawable.rounded_button_checked)
            btnNoIssues.setTextColor(Color.parseColor("#FFFFFF"))
            btnNoIssues.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check_white, 0, 0, 0)
            maintStatus = "보수완료"
        } else {
            btnNoIssues.setBackgroundResource(R.drawable.rounded_button_check)
            btnNoIssues.setTextColor(Color.parseColor("#A5A5A5"))
            btnNoIssues.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
            maintStatus = "신규접수"
        }
        btnNoIssues.tag = !isChecked
        validateSelection()
    }

    private fun deselectAllIssues() {
        val issueButtons = listOf(btnCable, btnPower, btnQr)
        issueButtons.forEach {
            it.tag = false
            it.setBackgroundResource(R.drawable.rounded_button_check)
            it.setTextColor(Color.parseColor("#A5A5A5"))
            it.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
        }
    }

    private fun validateSelection() {
        val issueButtons = listOf(btnCable, btnPower, btnQr)
        val issueSelected = issueButtons.any { it.tag as? Boolean == true }
        val noIssuesSelected = btnNoIssues.tag as? Boolean == true

        if (issueSelected && noIssuesSelected) {
            deselectAllIssues()
        }
    }

    // submitMaintenance 함수 수정
    @RequiresApi(Build.VERSION_CODES.O)
    private fun submitMaintenance() {
        val isCableChecked = btnCable.tag as? Boolean == true
        val isPowerChecked = btnPower.tag as? Boolean == true
        val isQrChecked = btnQr.tag as? Boolean == true
        val isNoIssuesChecked = btnNoIssues.tag as? Boolean == true

        if (!isCableChecked && !isPowerChecked && !isQrChecked && !isNoIssuesChecked) {
            Toast.makeText(this, "하나 이상의 항목을 선택하세요.", Toast.LENGTH_SHORT).show()
            return
        }

        if ((isCableChecked || isPowerChecked || isQrChecked) && !isNoIssuesChecked && editTextMemo.text.isEmpty()) {
            Toast.makeText(this, "특이사항을 작성해주세요.", Toast.LENGTH_SHORT).show()
            return
        }

        val userId = getUserId()
        val cableIdx = getCableIdx()
        val maintDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))

        // 각 항목에 대해 "불량" 또는 "양호" 값을 설정
        val maintCable = if (isCableChecked) "불량" else "양호"
        val maintPower = if (isPowerChecked) "불량" else "양호"
        val maintQr = if (isQrChecked) "불량" else "양호"
        val maintMsg = editTextMemo.text.toString()

        Log.d("CableMaintAddActivity", "maintCable: $maintCable, maintPower: $maintPower, maintQr: $maintQr")

        val maintenanceData = MaintenanceData(
            userId, cableIdx, maintCable, maintPower, maintQr, maintDate, maintMsg, maintStatus
        )

        sendMaintenanceData(maintenanceData)
    }

    private fun sendMaintenanceData(maintenanceData: MaintenanceData) {
        RetrofitClient.apiService.submitMaintenance(maintenanceData).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@CableMaintAddActivity, "제출 성공", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Toast.makeText(this@CableMaintAddActivity, "제출 실패: $errorBody", Toast.LENGTH_SHORT).show()
                    Log.d("CableMaintAddActivity", "제출 실패: $errorBody")
                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@CableMaintAddActivity, "서버 오류: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun checkForAdminAlarm() {
        val userId = getUserId()
        if (maintIdx != 0L) {
            RetrofitClient.apiService.getAlarmByMaintIdx(maintIdx, userId).enqueue(object : Callback<Map<String, String>> {
                override fun onResponse(call: Call<Map<String, String>>, response: Response<Map<String, String>>) {
                    if (response.isSuccessful) {
                        val alarmMsg = response.body()?.get("message")
                        if (!alarmMsg.isNullOrEmpty()) {
                            tvNotice.text = alarmMsg
                        } else {
                            tvNotice.text = "전달 받은 안내 사항이 없습니다."
                        }
                    } else {
                        Log.e("CableMaintAddActivity", "알림 메시지 불러오기 실패: ${response.errorBody()?.string()}")
                        tvNotice.text = "알림 메시지 불러오기 실패"
                    }
                }

                override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
                    Log.e("CableMaintAddActivity", "알림 메시지 불러오기 실패", t)
                    tvNotice.text = "알림 메시지 불러오기 실패"
                }
            })
        }
    }

    private fun getUserId(): String {
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        return sharedPref.getString("userId", "") ?: ""
    }

    private fun getCableIdx(): Long {
        return intent.getLongExtra("CABLE_IDX", 0L)
    }
}

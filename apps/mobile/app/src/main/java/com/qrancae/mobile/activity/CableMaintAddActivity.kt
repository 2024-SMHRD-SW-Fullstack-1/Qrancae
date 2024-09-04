package com.qrancae.mobile.activity

import android.content.ContentValues.TAG
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.model.MaintStatusResponse
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

        val backbutton: ImageView = findViewById(R.id.iv_back)
        backbutton.setOnClickListener {
            openback()
        }

        // 전달된 maint_idx가 있는지 확인
        maintIdx = intent.getLongExtra("MAINT_IDX", 0L)

        if (maintIdx == 0L && intent.getBooleanExtra("CREATE_MAINT_IDX", false)) {
            // maint_idx가 없고, 새로 생성해야 하는 경우에만 생성
            fetchMaintIdxAndFetchAlarmMessage()
        } else if (maintIdx != 0L) {
            // 기존 유지보수 항목이 있는 경우 알림 메시지를 가져옴
            checkMaintStatusAndFetchMessage(maintIdx)
        } else {
            // 초기화: 알림 메시지를 지우기
            clearNotice()
        }

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

    private fun fetchAlarmMessage() {
        Log.d(TAG, "Fetching Alarm Message for MaintIdx: $maintIdx")
        RetrofitClient.apiService.getAlarmByMaintIdx(maintIdx, getUserId()).enqueue(object : Callback<Map<String, String>> {
            override fun onResponse(call: Call<Map<String, String>>, response: Response<Map<String, String>>) {
                if (response.isSuccessful) {
                    val message = response.body()?.get("message") ?: "전달 사항이 없습니다."
                    Log.d(TAG, "Fetched message: $message")
                    tvNotice.text = message
                } else {
                    Log.e(TAG, "Failed to fetch Alarm Message: ${response.errorBody()?.string()}")
                    tvNotice.text = "알림 메시지를 가져오지 못했습니다."
                }
            }

            override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
                Log.e(TAG, "Error in fetching Alarm Message", t)
                tvNotice.text = "알림 메시지를 가져오는 중 오류가 발생했습니다."
            }
        })
    }

    private fun openback() {
        val intent = Intent(this, QRdetailActivity::class.java)
        startActivity(intent)
    }

    private fun checkMaintStatusAndFetchMessage(maintIdx: Long) {
        val userId = getUserId()
        RetrofitClient.apiService.getMaintenanceStatus(userId).enqueue(object : Callback<MaintStatusResponse> {
            override fun onResponse(call: Call<MaintStatusResponse>, response: Response<MaintStatusResponse>) {
                if (response.isSuccessful) {
                    val maintStatusResponse = response.body()

                    // 케이블이 진행 중인 상태인지 확인
                    val isInProgress = maintStatusResponse?.inProgressCount ?: 0 > 0

                    if (isInProgress) {
                        tvNotice.text = "점검 중인 케이블입니다."
                    } else {
                        fetchAlarmMessage() // 지시사항을 확인하여 메시지 표시
                    }
                } else {
                    Toast.makeText(this@CableMaintAddActivity, "유지보수 상태를 가져오는 데 실패했습니다.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<MaintStatusResponse>, t: Throwable) {
                Toast.makeText(this@CableMaintAddActivity, "서버 오류로 유지보수 상태를 가져오지 못했습니다.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun fetchMaintIdxAndFetchAlarmMessage() {
        val userId = getUserId()

        RetrofitClient.apiService.getMaintenanceStatus(userId).enqueue(object : Callback<MaintStatusResponse> {
            override fun onResponse(call: Call<MaintStatusResponse>, response: Response<MaintStatusResponse>) {
                if (response.isSuccessful) {
                    val maintStatusResponse = response.body()

                    // 이전 점검이 완료된 경우에만 새로운 maint_idx를 생성
                    val forceCreateNewMaintIdx = maintStatusResponse?.completedCount ?: 0 > 0

                    // 새로운 maint_idx를 생성하거나, 기존의 것을 사용할지 결정
                    RetrofitClient.apiService.getMaintIdx(userId, cableIdx.toInt(), forceCreateNewMaintIdx).enqueue(object : Callback<Int> {
                        override fun onResponse(call: Call<Int>, response: Response<Int>) {
                            if (response.isSuccessful) {
                                maintIdx = response.body()?.toLong() ?: 0L
                                if (maintIdx != 0L) {
                                    fetchAlarmMessage()  // 유지보수 항목을 가져옴
                                } else {
                                    clearNotice()  // 알림 초기화
                                }
                            } else {
                                Toast.makeText(this@CableMaintAddActivity, "유지보수 ID 가져오기 실패.", Toast.LENGTH_SHORT).show()
                            }
                        }

                        override fun onFailure(call: Call<Int>, t: Throwable) {
                            Toast.makeText(this@CableMaintAddActivity, "서버 오류로 유지보수 ID를 가져오지 못했습니다.", Toast.LENGTH_SHORT).show()
                        }
                    })
                } else {
                    Toast.makeText(this@CableMaintAddActivity, "유지보수 상태를 가져오는 데 실패했습니다.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<MaintStatusResponse>, t: Throwable) {
                Toast.makeText(this@CableMaintAddActivity, "서버 오류로 유지보수 상태를 가져오지 못했습니다.", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun clearNotice() {
        tvNotice.text = "전달 받은 안내 사항이 없습니다."
    }

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

        val maintenanceData: MaintenanceData

        if (isNoIssuesChecked) {
            maintenanceData = MaintenanceData(
                userId, cableIdx, null.toString(), null.toString(),
                null.toString(), maintDate, null.toString(), "보수완료"
            )
        } else {
            val maintCable = if (isCableChecked) "불량" else "양호"
            val maintPower = if (isPowerChecked) "불량" else "양호"
            val maintQr = if (isQrChecked) "불량" else "양호"
            val maintMsg = editTextMemo.text.toString()

            maintenanceData = MaintenanceData(
                userId, cableIdx, maintCable, maintPower, maintQr, maintDate, maintMsg, "신규접수"
            )
        }

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

    private fun getUserId(): String {
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        return sharedPref.getString("userId", "") ?: ""
    }

    private fun getCableIdx(): Long {
        return intent.getLongExtra("CABLE_IDX", 0L)
    }
}

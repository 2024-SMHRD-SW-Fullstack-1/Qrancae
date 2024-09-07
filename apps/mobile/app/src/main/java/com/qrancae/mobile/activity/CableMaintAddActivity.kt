package com.qrancae.mobile.activity

import android.content.ContentValues.TAG
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.network.RetrofitClient
import com.qrancae.mobile.model.MaintenanceData
import com.qrancae.mobile.util.ButtonAnimationUtil
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

class CableMaintAddActivity : AppCompatActivity() {

    // UI 요소 선언
    private lateinit var btnCable: Button
    private lateinit var btnPower: Button
    private lateinit var btnQr: Button
    private lateinit var btnNoIssues: Button
    private lateinit var editTextMemo: EditText
    private lateinit var btnSubmit: Button
    private lateinit var tvNotice: TextView
    private lateinit var btn_delete : ImageButton
    private lateinit var tvCharacterCount: TextView

    // 유지보수 상태와 관련된 변수
    private var maintStatus: String = "신규접수" // 유지보수 상태 기본값
    private var cableIdx: Long = 0L // 케이블 인덱스
    private var maintIdx: Long = 0L // 유지보수 인덱스

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cable_maint_add)

        // 오늘 날짜를 설정하는 함수 호출
        setCurrentDateToTextView()

        // UI 요소 초기화
        tvNotice = findViewById(R.id.tv_notice)
        cableIdx = getCableIdx()
        editTextMemo = findViewById(R.id.tv_report) // 정확한 EditText ID로 초기화
        tvCharacterCount = findViewById(R.id.tv_character_count) // 글자수 카운터 TextView


        // 유지보수 상태 확인 후 제출 버튼 활성화 여부 결정
        checkMaintenanceStatus(cableIdx) { isAllowedToSubmit ->
            btnSubmit.isEnabled = isAllowedToSubmit
            Log.d(TAG, "Maint Status Check: isAllowedToSubmit = $isAllowedToSubmit")
        }

        // 뒤로가기 버튼 클릭 리스너 설정
        val backbutton: ImageView = findViewById(R.id.iv_back)
        ButtonAnimationUtil.applyButtonAnimation(backbutton,this){
            openback()
        }

        val deleteButton = findViewById<ImageButton>(R.id.btn_delete)
        ButtonAnimationUtil.applyButtonAnimation(deleteButton,this){
            showDeleteDialog() // 다이얼로그 호출
        }

        // 유지보수 인덱스 확인 및 설정
        maintIdx = intent.getLongExtra("MAINT_IDX", 0L)
        Log.d(TAG, "MaintIdx: $maintIdx, CreateMaintIdx: ${intent.getBooleanExtra("CREATE_MAINT_IDX", false)}")

//        // 유지보수 인덱스를 확인하고 알림 메시지를 가져오는 로직
//        if (maintIdx != 0L) {
//            // 유지보수 항목이 있을 경우 알림 메시지를 가져옴
//            fetchAlarmMessageForInspection(maintIdx)
//        } else {
//            // 알림 메시지를 초기화
//            clearNotice()
//        }

        // 글자수 업데이트하는 TextWatcher 추가
        editTextMemo.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
                // 텍스트 변경 전 동작을 정의할 필요가 없으므로 비워둡니다.
            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                // 글자수를 TextView에 표시
                val currentTextLength = s?.length ?: 0
                tvCharacterCount.text = "$currentTextLength / 100"
            }

            override fun afterTextChanged(s: Editable?) {
                // 텍스트 변경 후 동작을 정의할 필요가 없으므로 비워둡니다.
            }
        })
        // 버튼 클릭 리스너 설정
        btnCable = findViewById(R.id.btn_cable)
        btnPower = findViewById(R.id.btn_power)
        btnQr = findViewById(R.id.btn_qr)
        btnNoIssues = findViewById(R.id.btn_no_issues)
        editTextMemo = findViewById(R.id.tv_report)
        btnSubmit = findViewById(R.id.btn_submit)

        btnCable.setOnClickListener { toggleButtonState(btnCable) }
        btnPower.setOnClickListener { toggleButtonState(btnPower) }
        btnQr.setOnClickListener { toggleButtonState(btnQr) }
        btnNoIssues.setOnClickListener { toggleNoIssuesState() }

        btnSubmit.setOnClickListener { submitMaintenance() }
    }

//    // 유지보수 상태와 알림 메시지를 가져오는 함수
//    private fun fetchAlarmMessageForInspection(maintIdx: Long) {
//        RetrofitClient.apiService.getAlarmByMaintIdx(maintIdx, getUserId())
//            .enqueue(object : Callback<Map<String, String>> {
//                override fun onResponse(
//                    call: Call<Map<String, String>>,
//                    response: Response<Map<String, String>>
//                ) {
//                    if (response.isSuccessful) {
//                        val message = response.body()?.get("message") ?: "전달 사항이 없습니다."
//                        tvNotice.text = message // 알림 메시지를 UI에 표시
//                    } else {
//                        Log.e(TAG, "Failed to fetch Alarm Message: ${response.errorBody()?.string()}")
//                        tvNotice.text = "알림 메시지를 가져오지 못했습니다."
//                    }
//                }
//
//                override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
//                    Log.e(TAG, "Error in fetching Alarm Message", t)
//                    tvNotice.text = "알림 메시지를 가져오는 중 오류가 발생했습니다."
//                }
//            })
//    }


    // 현재 날짜를 텍스트뷰에 설정하는 함수
    @RequiresApi(Build.VERSION_CODES.O)
    private fun setCurrentDateToTextView() {
        // 한국 시간대 기준으로 현재 날짜를 가져옵니다.
        val currentDateTimeInKorea = LocalDateTime.now(java.time.ZoneId.of("Asia/Seoul"))
        val formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd(EEE)", Locale.KOREAN) // 요일 포함 포맷
        val formattedDate = currentDateTimeInKorea.format(formatter)

        // 텍스트뷰에 오늘 날짜를 설정합니다.
        findViewById<TextView>(R.id.tv_date).text = formattedDate
    }



    // 뒤로 가기 메서드
    private fun openback() {
        finish()
    }

    // 제거 다이얼로그를 띄우는 로직
    private fun showDeleteDialog() {
        // 다이얼로그 빌더 생성
        val builder = android.app.AlertDialog.Builder(this)
        builder.setTitle("케이블 제거")
        builder.setMessage("정말 케이블을 제거하시겠습니까?")

        // 네 버튼을 눌렀을 때
        builder.setPositiveButton("네") { dialog, _ ->
            // 서버로 제거 요청
            removeCable()
            dialog.dismiss() // 다이얼로그 닫기
        }

        // 아니요 버튼을 눌렀을 때
        builder.setNegativeButton("아니요") { dialog, _ ->
            dialog.dismiss() // 다이얼로그 닫기
        }

        builder.show() // 다이얼로그 표시
    }

    private fun removeCable() {
        val userId = getUserId()
        val cableIdx = getCableIdx()

        RetrofitClient.apiService.removeCable(cableIdx, userId).enqueue(object : Callback<Void> {
            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                if (response.isSuccessful) {
                    Toast.makeText(this@CableMaintAddActivity, "케이블이 제거되었습니다.", Toast.LENGTH_SHORT).show()
                    moveToQRScanActivity() // QR 코드 스캔 화면으로 이동
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error"
                    Toast.makeText(this@CableMaintAddActivity, "케이블 제거 실패: $errorBody", Toast.LENGTH_SHORT).show()
                    Log.e("CableMaintAddActivity", "Remove Cable Error: $errorBody, Response code: ${response.code()}")                }
            }

            override fun onFailure(call: Call<Void>, t: Throwable) {
                Toast.makeText(this@CableMaintAddActivity, "서버 오류: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    // QR 코드 스캔 화면으로 이동하는 함수
    private fun moveToQRScanActivity() {
        val intent = Intent(this, QRCodeScanActivity::class.java)
        startActivity(intent)
        finish() // 현재 액티비티 종료
    }

    // 유지보수 인덱스를 가져오고 알림 메시지를 불러오는 함수
    private fun fetchMaintIdx(forceCreate: Boolean, callback: (Long) -> Unit) {
        val userId = getUserId()  // 사용자의 ID를 가져옴
        val cableIdx = getCableIdx()  // 케이블 인덱스를 가져옴

        RetrofitClient.apiService.getMaintIdx(userId, cableIdx.toInt(), forceCreate)
            .enqueue(object : Callback<Map<String, Int>> {
                override fun onResponse(call: Call<Map<String, Int>>, response: Response<Map<String, Int>>) {
                    if (response.isSuccessful) {
                        val fetchedMaintIdx = response.body()?.get("maintIdx")?.toLong() ?: 0L
                        Log.d(TAG, "Fetched maintIdx: $fetchedMaintIdx")
                        callback(fetchedMaintIdx)  // 가져온 maintIdx 값을 콜백으로 전달
                    } else {
                        Log.e(TAG, "Failed to fetch maintIdx")
                        callback(0L)
                    }
                }

                override fun onFailure(call: Call<Map<String, Int>>, t: Throwable) {
                    Log.e(TAG, "Error fetching maintIdx", t)
                    callback(0L)
                }
            })
    }

    // 점검 상태 확인 함수
    private fun checkMaintenanceStatus(cableIdx: Long, callback: (Boolean) -> Unit) {
        RetrofitClient.apiService.checkMaintenanceStatus(cableIdx)
            .enqueue(object : Callback<Map<String, String>> {
                override fun onResponse(call: Call<Map<String, String>>, response: Response<Map<String, String>>) {
                    if (response.isSuccessful) {
                        val maintUserId = response.body()?.get("maintUserId")
                        val userId = getUserId()
                        val status = response.body()?.get("status")
                        Log.d(TAG, "Maint UserId: $maintUserId, Current UserId: $userId, Status: $status")

                        when {
                            // 현재 사용자가 작업자일 때만 제출 가능
                            maintUserId == userId -> {
                                Log.d(TAG, "User is allowed to submit maintenance.")
                                // 점검 중 상태일 경우 기존 maintIdx를 가져옴 (forceCreate = false)
                                fetchMaintIdx(forceCreate = false) { fetchedMaintIdx ->
                                    maintIdx = fetchedMaintIdx
                                    Log.d(TAG, "Fetched maintIdx22: $maintIdx")

                                    // 알림 메시지 가져오기
                                    RetrofitClient.apiService.getAlarmByMaintIdx(maintIdx, userId)
                                        .enqueue(object : Callback<Map<String, String>> {
                                            override fun onResponse(call: Call<Map<String, String>>, response: Response<Map<String, String>>) {
                                                if (response.isSuccessful) {
                                                    val message = response.body()?.get("message") ?: "전달 사항이 없습니다."
                                                    tvNotice.text = message
                                                } else {
                                                    Log.e(TAG, "Failed to fetch Alarm Message: ${response.errorBody()?.string()}")
                                                    tvNotice.text = "알림 메시지를 가져오지 못했습니다."
                                                }
                                            }

                                            override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
                                                Log.e(TAG, "Error fetching alarm message", t)
                                                tvNotice.text = "알림 메시지를 가져오는 중 오류가 발생했습니다."
                                            }
                                        })

                                    callback(true)
                                }
                            }
                            // maintUserId가 null이고 상태가 "접수 가능"일 때 새 점검 시작 가능
                            maintUserId == null && status == "접수 가능" -> {
                                Log.d(TAG, "New maintenance can start.")
                                tvNotice.text = "전달 받은 안내 사항이 없습니다."
                                callback(true)
                            }
                            // maintUserId가 null이지만 작업자 배정 중인 경우
                            maintUserId == null && status == "점검중" -> {
                                Log.d(TAG, "Work is in progress. Worker assignment pending.")
                                Toast.makeText(this@CableMaintAddActivity, "작업자 배정 중입니다.", Toast.LENGTH_SHORT).show()
                                tvNotice.text = "작업자 배정 중입니다."
                                callback(false)
                            }
                            // 다른 사용자가 작업 중인 경우
                            maintUserId != userId -> {
                                Log.d(TAG, "Another user is working on maintenance.")
                                Toast.makeText(this@CableMaintAddActivity, "다른 사용자에 의해 점검 중입니다.", Toast.LENGTH_SHORT).show()
                                tvNotice.text = "다른 사용자에 의해 점검 중입니다."
                                callback(false)
                            }
                        }
                    } else {
                        Log.d(TAG, "Failed to check maintenance status from server.")
                        callback(false)
                    }
                }

                override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
                    Log.e(TAG, "Error in checking maintenance status", t)
                    callback(false)
                }
            })
    }



//    // 유지보수 인덱스를 가져오고 알림 메시지를 불러오는 함수 추가
//    private fun fetchMaintIdx() {
//        val userId = getUserId()  // 사용자의 ID를 가져옴
//        val cableIdx = getCableIdx()  // 케이블 인덱스를 가져옴
//
//        // maintIdx 값을 가져오는 요청
//        RetrofitClient.apiService.getMaintIdx(userId, cableIdx.toInt(), forceCreate = true)
//            .enqueue(object : Callback<Map<String, Int>> {
//                override fun onResponse(call: Call<Map<String, Int>>, response: Response<Map<String, Int>>) {
//                    if (response.isSuccessful) {
//                        maintIdx = response.body()?.get("maintIdx")?.toLong() ?: 0L
//                        Log.d(TAG, "Fetched maintIdx: $maintIdx")
//                        // maintIdx를 가져온 후 점검 중 알림 메시지 가져오기
//                        fetchAlarmMessageForInspection(maintIdx)
//                    } else {
//                        Log.e(TAG, "Failed to fetch maintIdx")
//                    }
//                }
//
//                override fun onFailure(call: Call<Map<String, Int>>, t: Throwable) {
//                    Log.e(TAG, "Error fetching maintIdx", t)
//                }
//            })
//    }

    // 알림 메시지를 초기화하는 함수
    private fun clearNotice() {
        tvNotice.text = "전달 받은 안내 사항이 없습니다."
    }

    // 버튼의 상태를 토글하는 함수
    private fun toggleButtonState(button: Button) {
        val isChecked = button.tag as? Boolean ?: false
        button.tag = !isChecked

        if (!isChecked) {
            button.setBackgroundResource(R.drawable.rounded_button_checked)
            button.setTextColor(Color.parseColor("#FFFFFF"))
            button.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check_white, 0, 0, 0)

            // 불량 버튼이 클릭되면 '이상없습니다' 자동 해지
            if (btnNoIssues.tag as? Boolean == true) {
                toggleNoIssuesState() // '이상없습니다' 해지
            }

        } else {
            button.setBackgroundResource(R.drawable.rounded_button_check)
            button.setTextColor(Color.parseColor("#A5A5A5"))
            button.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
        }

        validateSelection()
    }

    // '이상없습니다' 버튼의 상태를 토글하는 함수
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

    // 모든 불량 항목 버튼을 해제하는 함수
    private fun deselectAllIssues() {
        val issueButtons = listOf(btnCable, btnPower, btnQr)
        issueButtons.forEach {
            it.tag = false
            it.setBackgroundResource(R.drawable.rounded_button_check)
            it.setTextColor(Color.parseColor("#A5A5A5"))
            it.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
        }
    }

    // 항목 선택을 검증하는 함수
    private fun validateSelection() {
        val issueButtons = listOf(btnCable, btnPower, btnQr)
        val issueSelected = issueButtons.any { it.tag as? Boolean == true }
        val noIssuesSelected = btnNoIssues.tag as? Boolean == true

        if (issueSelected && noIssuesSelected) {
            deselectAllIssues()
        }
    }

    // 유지보수 데이터를 서버에 제출하는 함수
    @RequiresApi(Build.VERSION_CODES.O)
    private fun submitMaintenance() {
        val isCableChecked = btnCable.tag as? Boolean == true
        val isPowerChecked = btnPower.tag as? Boolean == true
        val isQrChecked = btnQr.tag as? Boolean == true
        val isNoIssuesChecked = btnNoIssues.tag as? Boolean == true

        // 모든 항목이 선택되지 않은 경우 경고 메시지
        if (!isCableChecked && !isPowerChecked && !isQrChecked && !isNoIssuesChecked) {
            Toast.makeText(this, "하나 이상의 항목을 선택하세요.", Toast.LENGTH_SHORT).show()
            return
        }

        // 특이사항 메모가 없는 경우 경고 메시지
        if ((isCableChecked || isPowerChecked || isQrChecked) && !isNoIssuesChecked && editTextMemo.text.isEmpty()) {
            Toast.makeText(this, "특이사항을 작성해주세요.", Toast.LENGTH_SHORT).show()
            return
        }

        // 점검 상태 확인 후 제출 가능 여부 판단
        checkMaintenanceStatus(cableIdx) { isAllowedToSubmit ->
            if (isAllowedToSubmit) {
                val userId = getUserId()
                val cableIdx = getCableIdx()
                val maintDate =
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))

                val maintenanceData: MaintenanceData

                if (isNoIssuesChecked) {
                    maintenanceData = MaintenanceData(
                        userId, cableIdx, "양호", "양호", "양호", maintDate, "이상 없습니다", "보수완료"
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
            } else {
                Toast.makeText(this@CableMaintAddActivity, "다른 사용자에 의해 점검 중입니다. 제출할 수 없습니다.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // 유지보수 데이터를 서버에 전송하는 함수
    private fun sendMaintenanceData(maintenanceData: MaintenanceData) {
        Log.d(TAG, "Sending maintenance data with maintIdx: $maintIdx")
        RetrofitClient.apiService.submitMaintenance(maintenanceData)
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Log.d(TAG, "Maintenance data submitted successfully for maintIdx: $maintIdx")
                        Toast.makeText(this@CableMaintAddActivity, "제출 성공", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        val errorBody = response.errorBody()?.string() ?: "Unknown error"
                        Log.e(TAG, "Maintenance submission failed for maintIdx: $maintIdx, Error: $errorBody")
                        Toast.makeText(this@CableMaintAddActivity, "제출 실패: $errorBody", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Log.e(TAG, "Server error: ${t.message}, while submitting maintenance for maintIdx: $maintIdx")
                    Toast.makeText(this@CableMaintAddActivity, "서버 오류: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    // SharedPreferences에서 사용자 ID를 가져오는 함수
    private fun getUserId(): String {
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val userId = sharedPref.getString("userId", "") ?: ""
        Log.d(TAG, "Fetched UserId: $userId")
        return userId
    }

    // Intent에서 케이블 인덱스를 가져오는 함수
    private fun getCableIdx(): Long {
        val cableIdx = intent.getLongExtra("CABLE_IDX", 0L)
        Log.d(TAG, "Fetched CableIdx: $cableIdx")
        return cableIdx
    }
}

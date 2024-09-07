package com.qrancae.mobile.activity

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.animation.AnimationUtils
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.model.CableData
import com.qrancae.mobile.network.RetrofitClient
import com.qrancae.mobile.util.ButtonAnimationUtil
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class QRdetailActivity : AppCompatActivity() {

    // 로그 태그 정의
    private val TAG = "QRdetailActivity"
    private lateinit var qrData: String // QR 데이터 저장
    private var cableIdx: Long = 0L // 케이블 인덱스 저장

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qrdetail)

        // QRCodeScanActivity에서 전달된 QR 데이터를 받음
        qrData = intent.getStringExtra("QR_DATA") ?: ""
        Log.d(TAG, "QR Data: $qrData")

        // QR 데이터에서 케이블 인덱스를 추출
        cableIdx = extractCableIdxFromQR(qrData)

        // 서버에서 케이블 데이터를 가져와 화면에 표시
        fetchAndDisplayCableData(cableIdx)

        // 홈 버튼 클릭 리스너 설정
        val homeButton: ImageButton = findViewById(R.id.btn_home)
        ButtonAnimationUtil.applyButtonAnimation(homeButton,this) {
            openHome()
        }

        // 점검 버튼 클릭 리스너 설정
        val repairButton: ImageButton = findViewById(R.id.btn_repair)
        ButtonAnimationUtil.applyButtonAnimation(repairButton,this) {
            openRepair(cableIdx)
        }

        // 뒤로가기 버튼 클릭 리스너 설정
        val backButton: ImageView = findViewById(R.id.iv_back)
        ButtonAnimationUtil.applyButtonAnimation(backButton,this){
            val intent = Intent(this, QRCodeScanActivity::class.java)
            intent.putExtra("RESET_SCAN", true)
            startActivity(intent)
            finish()
        }

        // 유지보수 내역 버튼 클릭 리스너 설정
        val listButton: ImageButton = findViewById(R.id.btn_list)
        ButtonAnimationUtil.applyButtonAnimation(listButton,this) {
            openList()
        }

        val qrButton: ImageButton = findViewById(R.id.btn_qrscan)
        ButtonAnimationUtil.applyButtonAnimation(qrButton,this){
            val intent = Intent(this, QRCodeScanActivity::class.java)
            intent.putExtra("RESET_SCAN", true)
            startActivity(intent)
            finish()
        }

    }

    // 홈 화면으로 이동
    private fun openHome() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    // 유지보수 페이지로 이동
    private fun openRepair(cableIdx: Long) {
        val intent = Intent(this, CableMaintAddActivity::class.java)
        intent.putExtra("CABLE_IDX", cableIdx)
        startActivity(intent)
    }

    // 유지보수 목록 페이지로 이동
    private fun openList() {
        val intent = Intent(this, CableMaintListActivity::class.java)
        intent.putExtra("CABLE_IDX", cableIdx)
        startActivity(intent)
    }

    // QR 코드에서 케이블 인덱스를 추출
    private fun extractCableIdxFromQR(qrData: String): Long {
        val dataParts = qrData.split(",")
        return dataParts.getOrNull(0)?.toLongOrNull() ?: 0L
    }

    // 서버에서 케이블 데이터를 가져와 화면에 표시
    private fun fetchAndDisplayCableData(cableIdx: Long) {
        Log.d(TAG, "Fetching Cable Data for Cable Index: $cableIdx")

        RetrofitClient.apiService.getCableDate(cableIdx).enqueue(object : Callback<CableData> {
            @RequiresApi(Build.VERSION_CODES.O)
            override fun onResponse(call: Call<CableData>, response: Response<CableData>) {
                if (response.isSuccessful) {
                    val cableData = response.body()
                    Log.d(TAG, "Cable Data Response: $cableData")

                    // 케이블 데이터를 화면에 표시
                    cableData?.let {
                        displayCableData(it)
                    } ?: run {
                        Log.e(TAG, "Cable Data is null in the response")
                        displayErrorMessage()
                    }
                } else {
                    Log.e(TAG, "Failed to fetch Cable Data: ${response.errorBody()?.string()}")
                    displayErrorMessage()
                }
            }

            override fun onFailure(call: Call<CableData>, t: Throwable) {
                Log.e(TAG, "Error in fetching Cable Data", t)
                displayErrorMessage()
            }
        })
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun displayCableData(cableData: CableData) {
        // TextView에 서버에서 가져온 데이터를 표시
        findViewById<TextView>(R.id.s_rack_number).text = cableData.sRackNumber ?: "N/A"
        findViewById<TextView>(R.id.s_rack_location).text = cableData.sRackLocation ?: "N/A"
        findViewById<TextView>(R.id.s_server_name).text = cableData.sServerName ?: "N/A"
        findViewById<TextView>(R.id.s_port_number).text = cableData.sPortNumber ?: "N/A"
        findViewById<TextView>(R.id.d_rack_number).text = cableData.dRackNumber ?: "N/A"
        findViewById<TextView>(R.id.d_rack_location).text = cableData.dRackLocation ?: "N/A"
        findViewById<TextView>(R.id.d_server_name).text = cableData.dServerName ?: "N/A"
        findViewById<TextView>(R.id.d_port_number).text = cableData.dPortNumber ?: "N/A"

        // 설치 날짜가 있는 경우만 표시
        if (cableData.installDate != null) {
            findViewById<TextView>(R.id.cable_date).text = formatCableDate(cableData.installDate)
            val elapsedDays = calculateElapsedDate(cableData.installDate)
            findViewById<TextView>(R.id.aging_date).text = elapsedDays ?: "N/A"
        } else {
            findViewById<TextView>(R.id.cable_date).text = "N/A"
            findViewById<TextView>(R.id.aging_date).text = "N/A"
        }
    }

    // 서버에서 받은 설치 날짜를 형식화하는 함수
    @RequiresApi(Build.VERSION_CODES.O)
    private fun formatCableDate(dateString: String): String {
        return try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
            val dateTime = LocalDateTime.parse(dateString, formatter)
            dateTime.format(DateTimeFormatter.ofPattern("yy-MM-dd"))
        } catch (e: Exception) {
            Log.e(TAG, "Error formatting cable date", e)
            "N/A" // 오류가 발생하면 N/A 반환
        }
    }

    // 경과 날짜를 계산
    @RequiresApi(Build.VERSION_CODES.O)
    private fun calculateElapsedDate(dateString: String): String? {
        return try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
            val cableDate = LocalDateTime.parse(dateString, formatter)
            val daysElapsed = ChronoUnit.DAYS.between(cableDate.toLocalDate(), LocalDateTime.now().toLocalDate())

            if (daysElapsed <= 0L) {
                "오늘 포설됨"
            } else {
                "+${daysElapsed}일"
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error calculating elapsed date", e)
            null
        }
    }

    // 오류 발생 시 기본값 설정
    private fun displayErrorMessage() {
        findViewById<TextView>(R.id.s_rack_number).text = "N/A"
        findViewById<TextView>(R.id.s_rack_location).text = "N/A"
        findViewById<TextView>(R.id.s_server_name).text = "N/A"
        findViewById<TextView>(R.id.s_port_number).text = "N/A"
        findViewById<TextView>(R.id.d_rack_number).text = "N/A"
        findViewById<TextView>(R.id.d_rack_location).text = "N/A"
        findViewById<TextView>(R.id.d_server_name).text = "N/A"
        findViewById<TextView>(R.id.d_port_number).text = "N/A"
        findViewById<TextView>(R.id.cable_date).text = "N/A"
        findViewById<TextView>(R.id.aging_date).text = "N/A"
    }


    // 앱이 다시 시작될 때 데이터를 다시 가져와 표시
    @RequiresApi(Build.VERSION_CODES.O)
    override fun onResume() {
        super.onResume()
        fetchAndDisplayCableData(cableIdx)
    }
}

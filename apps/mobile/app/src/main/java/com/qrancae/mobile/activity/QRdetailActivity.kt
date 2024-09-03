package com.qrancae.mobile.activity

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.animation.AnimationUtils
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.model.CableData
import com.qrancae.mobile.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class QRdetailActivity : AppCompatActivity() {

    private val TAG = "QRdetailActivity"
    private lateinit var qrData: String
    private var cableIdx: Long = 0L

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qrdetail)

        // QRCodeScanActivity에서 전달된 QR 데이터 받아오기
        qrData = intent.getStringExtra("QR_DATA") ?: ""
        Log.d(TAG, "QR Data: $qrData")

        // QR 데이터에서 케이블 인덱스 추출
        cableIdx = extractCableIdxFromQR(qrData)

        // 홈 버튼 클릭 리스너
        val homeButton: ImageButton = findViewById(R.id.btn_home)
        setButtonAnimation(homeButton) {
            openHome()
        }

        // 점검 버튼 클릭 리스너
        val repairButton: ImageButton = findViewById(R.id.btn_repair)
        setButtonAnimation(repairButton) {
            openRepair(cableIdx)  // 점검 페이지로 이동
        }

        // 케이블 유지보수내역 버튼 클릭 리스너
        val listButton: ImageButton = findViewById(R.id.btn_list)
        setButtonAnimation(listButton) {
            openList()
        }

        // QR 데이터를 분리하여 화면에 표시
        qrData?.let {
            val dataParts = it.split(",")
            Log.d(TAG, "Parsed QR Data Parts: $dataParts")

            cableIdx?.let { idx ->
                fetchAndDisplayCableDate(idx)
            } ?: run {
                Log.e(TAG, "Invalid Cable Index: $cableIdx")
                displayCableDate(null)
            }

            // Source와 Destination에 각각 데이터 매핑
            findViewById<TextView>(R.id.s_rack_number).text = dataParts.getOrNull(1) ?: "N/A"
            findViewById<TextView>(R.id.s_rack_location).text = dataParts.getOrNull(2) ?: "N/A"
            findViewById<TextView>(R.id.s_server_name).text = dataParts.getOrNull(3) ?: "N/A"
            findViewById<TextView>(R.id.s_port_number).text = dataParts.getOrNull(4) ?: "N/A"

            findViewById<TextView>(R.id.d_rack_number).text = dataParts.getOrNull(5) ?: "N/A"
            findViewById<TextView>(R.id.d_rack_location).text = dataParts.getOrNull(6) ?: "N/A"
            findViewById<TextView>(R.id.d_server_name).text = dataParts.getOrNull(7) ?: "N/A"
            findViewById<TextView>(R.id.d_port_number).text = dataParts.getOrNull(8) ?: "N/A"
        } ?: run {
            Log.e(TAG, "QR Data is null")
        }

        findViewById<ImageButton>(R.id.btn_qrscan).setOnClickListener {
            val intent = Intent(this, QRCodeScanActivity::class.java)
            intent.putExtra("RESET_SCAN", true)
            startActivity(intent)
            finish()
        }
    }

    private fun openHome() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    private fun extractCableIdxFromQR(qrData: String): Long {
        val dataParts = qrData.split(",")
        return dataParts.getOrNull(0)?.toLongOrNull() ?: 0L
    }

    private fun getCableIdx(): Long {
        return cableIdx
    }

    private fun openRepair(cableIdx: Long) {
        val intent = Intent(this, CableMaintAddActivity::class.java)
        intent.putExtra("CABLE_IDX", cableIdx)
        startActivity(intent)
    }

    private fun openList() {
        val intent = Intent(this, CableMaintListActivity::class.java)
        startActivity(intent)
    }

    private fun setButtonAnimation(button: ImageButton, onClick: () -> Unit) {
        button.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.startAnimation(AnimationUtils.loadAnimation(this, R.anim.button_shrink))
                }
                MotionEvent.ACTION_UP -> {
                    v.startAnimation(AnimationUtils.loadAnimation(this, R.anim.button_expand))
                    onClick()
                }
            }
            true
        }
    }

    private fun fetchAndDisplayCableDate(cableIdx: Long) {
        Log.d(TAG, "Fetching Cable Date for Cable Index: $cableIdx")

        RetrofitClient.apiService.getCableDate(cableIdx).enqueue(object : Callback<CableData> {
            @RequiresApi(Build.VERSION_CODES.O)
            override fun onResponse(call: Call<CableData>, response: Response<CableData>) {
                if (response.isSuccessful) {
                    val cableData = response.body()
                    Log.d(TAG, "Cable Data Response: $cableData")
                    cableData?.cableDate?.let { cableDate ->
                        displayCableDate(cableDate.toString())
                    } ?: run {
                        Log.e(TAG, "Cable Date is null in the response")
                        displayCableDate(null)
                    }
                } else {
                    Log.e(TAG, "Failed to fetch Cable Data: ${response.errorBody()?.string()}")
                    displayCableDate(null)
                }
            }

            @RequiresApi(Build.VERSION_CODES.O)
            override fun onFailure(call: Call<CableData>, t: Throwable) {
                Log.e(TAG, "Error in fetching Cable Data", t)
                displayCableDate(null)
            }
        })
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun displayCableDate(cableDateStr: String?) {
        val cableDateTextView = findViewById<TextView>(R.id.cable_date)
        val elasedDateTextView = findViewById<TextView>(R.id.aging_date)

        if (cableDateStr != null) {
            try {
                Log.d(TAG, "Displaying Cable Date: $cableDateStr")
                val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
                val cableDate = LocalDateTime.parse(cableDateStr, formatter)
                val formattedCableDate = cableDate.format(DateTimeFormatter.ofPattern("yy-MM-dd"))

                cableDateTextView.text = formattedCableDate

                val dateElapsed = ChronoUnit.DAYS.between(cableDate.toLocalDate(), LocalDateTime.now().toLocalDate())
                elasedDateTextView.text = when {
                    dateElapsed == 0L -> "오늘 설치됨"
                    dateElapsed > 0 -> "+${dateElapsed}일"
                    else -> "Invalid date"
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error parsing/displaying Cable Date", e)
                cableDateTextView.text = "N/A"
                elasedDateTextView.text = "N/A"
            }
        } else {
            Log.e(TAG, "Cable Date String is null")
            cableDateTextView.text = "N/A"
            elasedDateTextView.text = "N/A"
        }
    }

    private fun getUserId(): String {
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        return sharedPref.getString("userId", "") ?: ""
    }
}

package com.qrancae.mobile

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.animation.AnimationUtils
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class QRdetailActivity : AppCompatActivity() {

    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qrdetail)

        // QRCodeScanActivity에서 전달된 QR 데이터 받아오기
        val qrData = intent.getStringExtra("QR_DATA")

        // 홈 버튼 클릭 리스너
        val homeButton: ImageButton = findViewById(R.id.btn_home)
        setButtonAnimation(homeButton) {
            openHome()
        }

        // 점검 버튼 클릭 리스너
        val repairButton : ImageButton = findViewById(R.id.btn_repair)
        setButtonAnimation(repairButton) {
            openRepair()
        }

        // 케이블 유지보수내역 버튼 클릭 리스너
        val listButton : ImageButton = findViewById(R.id.btn_list)
        setButtonAnimation(listButton) {
            openList()
        }

        // qrData가 null이 아닌지 확인 후 데이터 분리
        qrData?.let {
            val dataParts = it.split(",")

            // Source와 Destination에 각각 데이터 매핑
            findViewById<TextView>(R.id.s_rack_number).text = dataParts.getOrNull(1) ?: "N/A"
            findViewById<TextView>(R.id.s_rack_location).text = dataParts.getOrNull(2) ?: "N/A"
            findViewById<TextView>(R.id.s_server_name).text = dataParts.getOrNull(3) ?: "N/A"
            findViewById<TextView>(R.id.s_port_number).text = dataParts.getOrNull(4) ?: "N/A"

            findViewById<TextView>(R.id.d_rack_number).text = dataParts.getOrNull(5) ?: "N/A"
            findViewById<TextView>(R.id.d_rack_location).text = dataParts.getOrNull(6) ?: "N/A"
            findViewById<TextView>(R.id.d_server_name).text = dataParts.getOrNull(7) ?: "N/A"
            findViewById<TextView>(R.id.d_port_number).text = dataParts.getOrNull(8) ?: "N/A"
        }

        findViewById<ImageButton>(R.id.btn_qrscan).setOnClickListener{
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

    private fun openRepair() {
        val intent = Intent(this, CableMaintAddActivity::class.java)
        startActivity(intent)
    }

    private fun openList(){
        val intent = Intent(this,CableMaintListActivity::class.java)
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

}

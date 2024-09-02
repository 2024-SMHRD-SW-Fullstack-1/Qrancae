package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R

class AlarmListActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_alarm_list)

        // 뒤로가기 버튼 클릭 리스너 설정
        val backbutton: ImageView = findViewById(R.id.iv_back)
        backbutton.setOnClickListener {
            openback()
        }

    }

    private fun openback() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }
}

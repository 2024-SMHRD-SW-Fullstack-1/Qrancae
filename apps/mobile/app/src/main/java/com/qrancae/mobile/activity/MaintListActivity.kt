package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R

class MaintListActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_maint_list)

        val backButton: ImageView = findViewById(R.id.iv_back)
        backButton.setOnClickListener {
            backHome()
        }

        // MainActivity에서 전달된 신규 접수 건수 받기
        val newEntryCount = intent.getIntExtra("NEW_ENTRY_COUNT", 0)
        val totalReceiptsTextView: TextView = findViewById(R.id.tv_total_receipts)
        totalReceiptsTextView.text = "신규 접수 총 $newEntryCount 건 입니다"
    }

    private fun backHome() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }
}
package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.qrancae.mobile.R
import com.qrancae.mobile.adapter.AlarmAdapter
import com.qrancae.mobile.model.AlarmViewModel

class AlarmListActivity : AppCompatActivity() {

    private lateinit var alarmViewModel: AlarmViewModel
    private lateinit var alarmAdapter: AlarmAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_alarm_list)

        val recyclerView: RecyclerView = findViewById(R.id.recycler_view_alarms)
        recyclerView.layoutManager = LinearLayoutManager(this)
        alarmAdapter = AlarmAdapter { alarm ->
            openMaint() // 알림을 클릭하면 진행상황 페이지로 이동
        }
        recyclerView.adapter = alarmAdapter

        alarmViewModel = ViewModelProvider(this).get(AlarmViewModel::class.java)

        val userId = getSharedPreferences("USER_PREFS", MODE_PRIVATE).getString("userId", "") ?: ""
        if (userId.isNotEmpty()) {
            alarmViewModel.loadAlarms(userId)
        }

        alarmViewModel.alarms.observe(this) { alarms ->
            alarmAdapter.submitList(alarms)
            findViewById<TextView>(R.id.tv_no_alarm).visibility = if (alarms.isNullOrEmpty()) View.VISIBLE else View.GONE
        }

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

    private fun openMaint() {
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val newEntryCount = sharedPref.getInt("NEW_ENTRY_COUNT", 0)
        val inProgressCount = sharedPref.getInt("IN_PROGRESS_COUNT", 0)

        val intent = Intent(this, MaintListActivity::class.java).apply {
            putExtra("NEW_ENTRY_COUNT", newEntryCount)
            putExtra("IN_PROGRESS_COUNT", inProgressCount)
        }
        startActivity(intent)
    }

}

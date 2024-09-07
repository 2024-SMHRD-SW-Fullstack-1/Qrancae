package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.qrancae.mobile.R
import com.qrancae.mobile.adapter.AlarmAdapter
import com.qrancae.mobile.model.AlarmViewModel
import com.qrancae.mobile.util.ButtonAnimationUtil

class AlarmListActivity : AppCompatActivity() {

    // ViewModel과 Adapter를 선언
    private lateinit var alarmViewModel: AlarmViewModel
    private lateinit var alarmAdapter: AlarmAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_alarm_list)

        // 리사이클러뷰 설정: 알람 목록을 표시하기 위한 RecyclerView와 Adapter 초기화
        val recyclerView: RecyclerView = findViewById(R.id.recycler_view_alarms)
        recyclerView.layoutManager = LinearLayoutManager(this)
        alarmAdapter = AlarmAdapter { alarm ->
            openMaint() // 알람을 클릭했을 때 유지보수 페이지로 이동
        }
        recyclerView.adapter = alarmAdapter

        // ViewModelProvider를 통해 AlarmViewModel을 가져옴
        alarmViewModel = ViewModelProvider(this).get(AlarmViewModel::class.java)

        // SharedPreferences에서 저장된 userId를 불러옴
        val userId = getSharedPreferences("USER_PREFS", MODE_PRIVATE).getString("userId", "") ?: ""

        // userId가 있으면 알람 데이터를 ViewModel을 통해 로드
        if (userId.isNotEmpty()) {
            alarmViewModel.loadAlarms(userId)
        }

        // ViewModel의 alarms LiveData를 관찰하여 데이터가 변경될 때 UI 업데이트
        alarmViewModel.alarms.observe(this) { alarms ->
            // Adapter에 알람 목록 전달
            alarmAdapter.submitList(alarms)
            // 알람이 없으면 "알람이 없습니다" 메시지 표시
            findViewById<TextView>(R.id.tv_no_alarm).visibility =
                if (alarms.isNullOrEmpty()) View.VISIBLE else View.GONE
        }

        // 뒤로 가기 버튼 설정: 메인 화면으로 돌아감
        val backbutton: ImageView = findViewById(R.id.iv_back)
        ButtonAnimationUtil.applyButtonAnimation(backbutton, this) {
            openback()
        }
    }

    // 뒤로 가기 메서드: MainActivity로 이동
    private fun openback() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    // 유지보수 목록 화면으로 이동하는 메서드
    private fun openMaint() {
        // SharedPreferences에서 새로운 항목 수와 진행 중인 항목 수를 불러옴
        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val newEntryCount = sharedPref.getInt("NEW_ENTRY_COUNT", 0)
        val inProgressCount = sharedPref.getInt("IN_PROGRESS_COUNT", 0)

        // MaintListActivity로 이동하고, 새로운 항목과 진행 중 항목 수를 인텐트에 포함
        val intent = Intent(this, MaintListActivity::class.java).apply {
            putExtra("NEW_ENTRY_COUNT", newEntryCount)
            putExtra("IN_PROGRESS_COUNT", inProgressCount)
        }
        startActivity(intent)
    }

}

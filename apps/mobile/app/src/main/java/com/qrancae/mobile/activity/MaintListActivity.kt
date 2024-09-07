package com.qrancae.mobile.activity

import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import androidx.media3.common.util.Log
import androidx.media3.common.util.UnstableApi
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.qrancae.mobile.R
import com.qrancae.mobile.adapter.MaintenanceTaskAdapter
import com.qrancae.mobile.model.MaintenanceViewModel
import com.qrancae.mobile.util.ButtonAnimationUtil
import com.qrancae.mobile.util.SpaceItemDecoration

class MaintListActivity : AppCompatActivity() {

    private val maintenanceViewModel: MaintenanceViewModel by viewModels()

    @OptIn(UnstableApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_maint_list)

        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
        val userId = sharedPref.getString("userId", "") ?: ""

        if (userId.isEmpty()) {
            Toast.makeText(this, "로그인 정보가 없습니다.", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        maintenanceViewModel.initialize(userId)

        val recyclerView = findViewById<RecyclerView>(R.id.recycler_view_maintenance_tasks)
        val adapter = MaintenanceTaskAdapter(emptyList())
        recyclerView.adapter = adapter
        recyclerView.layoutManager = LinearLayoutManager(this)

        recyclerView.addItemDecoration(SpaceItemDecoration(-50)) // 16dp 간격을 추가

        maintenanceViewModel.maintenanceTasks.observe(this, Observer { tasks ->
            tasks?.let {
                adapter.updateTasks(it)
                Log.d(TAG, "Updated tasks in adapter: $it")  // 업데이트된 데이터 출력
            }
        })

        maintenanceViewModel.errorMessage.observe(this, Observer { message ->
            message?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        })

        // 최신순 버튼 클릭 시
        val btnNew = findViewById<TextView>(R.id.btn_new)
        btnNew.setOnClickListener {
            maintenanceViewModel.onSortSelected("최신순")
            updateTabSort("최신순")
        }
        btnNew.setOnTouchListener { view, motionEvent ->
            handleTouchAnimation(view, motionEvent)
        }

        // 오래된순 버튼 클릭 시
        val btnOld = findViewById<TextView>(R.id.btn_old)
        btnOld.setOnClickListener {
            maintenanceViewModel.onSortSelected("오래된순")
            updateTabSort("오래된순")
        }
        btnOld.setOnTouchListener { view, motionEvent ->
            handleTouchAnimation(view, motionEvent)
        }

        // 탭 버튼들 클릭 처리
        val tabAll = findViewById<TextView>(R.id.tv_tab_all)
        val tabInProgress = findViewById<TextView>(R.id.tv_tab_in_progress)
        val tabNew = findViewById<TextView>(R.id.tv_tab_new)
        val tabCompleted = findViewById<TextView>(R.id.tv_tab_completed)

        tabAll.setOnClickListener { maintenanceViewModel.onTabSelected("전체") }
        tabAll.setOnTouchListener { view, motionEvent -> handleTouchAnimation(view, motionEvent) }

        tabInProgress.setOnClickListener { maintenanceViewModel.onTabSelected("점검중") }
        tabInProgress.setOnTouchListener { view, motionEvent -> handleTouchAnimation(view, motionEvent) }

        tabNew.setOnClickListener { maintenanceViewModel.onTabSelected("신규접수") }
        tabNew.setOnTouchListener { view, motionEvent -> handleTouchAnimation(view, motionEvent) }

        tabCompleted.setOnClickListener { maintenanceViewModel.onTabSelected("보수완료") }
        tabCompleted.setOnTouchListener { view, motionEvent -> handleTouchAnimation(view, motionEvent) }

        maintenanceViewModel.selectedTab.observe(this, Observer { selectedTab ->
            updateTabUI(selectedTab)
        })

        // 뒤로가기 버튼 애니메이션 처리
        val backButton: ImageView = findViewById(R.id.iv_back)
        ButtonAnimationUtil.applyButtonAnimation(backButton, this) {
            backHome()
        }

        // QR 코드 버튼 애니메이션 처리
        val qrButton: FloatingActionButton = findViewById(R.id.btn_qr)
        ButtonAnimationUtil.applyButtonAnimation(qrButton, this) {
            qrScan()
        }

        val noDataTextView: TextView = findViewById(R.id.tv_nope)
        maintenanceViewModel.maintenanceTasks.observe(this, Observer { tasks ->
            noDataTextView.visibility = if (tasks.isNullOrEmpty()) View.VISIBLE else View.GONE
        })

        val newEntryCount = intent.getIntExtra("NEW_ENTRY_COUNT", 0)
        val inProgressCount = intent.getIntExtra("IN_PROGRESS_COUNT", 0)
        val totalReceiptsTextView: TextView = findViewById(R.id.tv_total_receipts)
        totalReceiptsTextView.text = "현재 점검 중인 작업은 총 $inProgressCount 건,\n신규 접수는 $newEntryCount 건입니다."
    }

    // 애니메이션 적용 메서드
    private fun handleTouchAnimation(view: View, motionEvent: MotionEvent): Boolean {
        when (motionEvent.action) {
            MotionEvent.ACTION_DOWN -> {
                // 눌렀을 때 scale_down 애니메이션 적용
                view.startAnimation(AnimationUtils.loadAnimation(this, R.anim.scale_down))
                view.setBackgroundColor(ContextCompat.getColor(this, R.color.pressed_background_color)) // 배경색 변경
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                // 손을 뗐을 때 scale_up 애니메이션 적용
                view.startAnimation(AnimationUtils.loadAnimation(this, R.anim.scale_up))
                view.setBackgroundColor(ContextCompat.getColor(this, R.color.default_background_color)) // 배경색 복원
            }
        }
        return false
    }

    private fun updateTabUI(selectedTab: String) {
        val tabAll = findViewById<TextView>(R.id.tv_tab_all)
        val tabInProgress = findViewById<TextView>(R.id.tv_tab_in_progress)
        val tabNew = findViewById<TextView>(R.id.tv_tab_new)
        val tabCompleted = findViewById<TextView>(R.id.tv_tab_completed)

        val defaultColor = ContextCompat.getColor(this, R.color.default_text_color)
        val selectedColor = ContextCompat.getColor(this, R.color.selected_tab_color)

        tabAll.setTextColor(if (selectedTab == "전체") selectedColor else defaultColor)
        tabInProgress.setTextColor(if (selectedTab == "점검중") selectedColor else defaultColor)
        tabNew.setTextColor(if (selectedTab == "신규접수") selectedColor else defaultColor)
        tabCompleted.setTextColor(if (selectedTab == "보수완료") selectedColor else defaultColor)
    }

    private fun updateTabSort(selectedTab: String){
        val tabFast = findViewById<TextView>(R.id.btn_new)
        val tabOld = findViewById<TextView>(R.id.btn_old)

        val defaultColor2 = ContextCompat.getColor(this, R.color.default_text_color2)
        val selectedColor2 = ContextCompat.getColor(this, R.color.selected_tab_color2)

        tabFast.setTextColor(if(selectedTab == "최신순") selectedColor2 else defaultColor2)
        tabOld.setTextColor(if(selectedTab == "오래된순") selectedColor2 else defaultColor2)
    }

    private fun backHome() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }

    private fun qrScan() {
        val intent = Intent(this, QRCodeScanActivity::class.java)
        startActivity(intent)
    }

    override fun onBackPressed() {
        super.onBackPressed()
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        startActivity(intent)
        finish()
    }
}

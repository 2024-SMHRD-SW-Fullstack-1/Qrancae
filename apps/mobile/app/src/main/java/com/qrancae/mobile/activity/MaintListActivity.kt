package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.qrancae.mobile.R
import com.qrancae.mobile.adapter.MaintenanceTaskAdapter
import com.qrancae.mobile.model.MaintenanceViewModel

class MaintListActivity : AppCompatActivity() {

    private val maintenanceViewModel: MaintenanceViewModel by viewModels()

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

        maintenanceViewModel.maintenanceTasks.observe(this, Observer { tasks ->
            tasks?.let {
                adapter.updateTasks(it)
            }
        })

        maintenanceViewModel.errorMessage.observe(this, Observer { message ->
            message?.let {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        })

        findViewById<TextView>(R.id.btn_new).setOnClickListener {
            maintenanceViewModel.onSortSelected("최신순")
        }

        findViewById<TextView>(R.id.btn_old).setOnClickListener {
            maintenanceViewModel.onSortSelected("오래된순")
        }

        val tabAll = findViewById<TextView>(R.id.tv_tab_all)
        val tabInProgress = findViewById<TextView>(R.id.tv_tab_in_progress)
        val tabNew = findViewById<TextView>(R.id.tv_tab_new)
        val tabCompleted = findViewById<TextView>(R.id.tv_tab_completed)

        tabAll.setOnClickListener { maintenanceViewModel.onTabSelected("전체") }
        tabInProgress.setOnClickListener { maintenanceViewModel.onTabSelected("진행중") }
        tabNew.setOnClickListener { maintenanceViewModel.onTabSelected("신규접수") }
        tabCompleted.setOnClickListener { maintenanceViewModel.onTabSelected("보수완료") }

        maintenanceViewModel.selectedTab.observe(this, Observer { selectedTab ->
            updateTabUI(selectedTab)
        })

        val backButton: ImageView = findViewById(R.id.iv_back)
        backButton.setOnClickListener { backHome() }

        val qrButton: FloatingActionButton = findViewById(R.id.btn_qr)
        qrButton.setOnClickListener { qrScan() }

        val noDataTextView: TextView = findViewById(R.id.tv_nope)
        maintenanceViewModel.maintenanceTasks.observe(this, Observer { tasks ->
            noDataTextView.visibility = if (tasks.isNullOrEmpty()) View.VISIBLE else View.GONE
        })

        val newEntryCount = intent.getIntExtra("NEW_ENTRY_COUNT", 0)
        val inProgressCount = intent.getIntExtra("IN_PROGRESS_COUNT", 0)
        val totalReceiptsTextView: TextView = findViewById(R.id.tv_total_receipts)
        totalReceiptsTextView.text = "현재 진행 중인 작업은 총 $inProgressCount 건,\n신규 접수는 $newEntryCount 건입니다."
    }

    private fun updateTabUI(selectedTab: String) {
        val tabAll = findViewById<TextView>(R.id.tv_tab_all)
        val tabInProgress = findViewById<TextView>(R.id.tv_tab_in_progress)
        val tabNew = findViewById<TextView>(R.id.tv_tab_new)
        val tabCompleted = findViewById<TextView>(R.id.tv_tab_completed)

        val defaultColor = ContextCompat.getColor(this, R.color.default_text_color)
        val selectedColor = ContextCompat.getColor(this, R.color.selected_tab_color)

        tabAll.setTextColor(if (selectedTab == "전체") selectedColor else defaultColor)
        tabInProgress.setTextColor(if (selectedTab == "진행중") selectedColor else defaultColor)
        tabNew.setTextColor(if (selectedTab == "신규접수") selectedColor else defaultColor)
        tabCompleted.setTextColor(if (selectedTab == "보수완료") selectedColor else defaultColor)
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

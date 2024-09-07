package com.qrancae.mobile.activity

import android.os.Bundle
import android.util.Log
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.qrancae.mobile.R
import com.qrancae.mobile.activity.MaintHistoryAdapter
import com.qrancae.mobile.model.CableHistoryData
import com.qrancae.mobile.model.CableMaintListViewModel
import com.qrancae.mobile.network.RetrofitClient
import com.qrancae.mobile.util.ButtonAnimationUtil
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CableMaintListActivity : AppCompatActivity() {

    private lateinit var maintListRecyclerView: RecyclerView
    private lateinit var maintCountTextView: TextView
    private val viewModel: CableMaintListViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cable_maint_list)

        maintListRecyclerView = findViewById(R.id.maint_list_recyclerview)
        maintCountTextView = findViewById(R.id.tv_maint)

        // 뒤로가기 버튼 클릭 리스너 설정
        val backbutton: ImageView = findViewById(R.id.iv_back)
        ButtonAnimationUtil.applyButtonAnimation(backbutton, this) {
            openback()
        }

        // RecyclerView 설정
        maintListRecyclerView.layoutManager = LinearLayoutManager(this)

        // LiveData를 관찰하여 데이터 변경 시 UI 업데이트
        viewModel.historyList.observe(this, Observer { historyList ->
            val processedList = processHistoryList(historyList)
            setupRecyclerView(processedList)
        })

        val cableIdx = intent.getLongExtra("CABLE_IDX", 0L)

        // 데이터 가져오기
        fetchCableHistory(cableIdx)
    }

    private fun fetchCableHistory(cableIdx: Long) {
        RetrofitClient.apiService.getCableHistory(cableIdx).enqueue(object : Callback<List<CableHistoryData>> {
            override fun onResponse(call: Call<List<CableHistoryData>>, response: Response<List<CableHistoryData>>) {
                if (response.isSuccessful) {
                    val historyList = response.body() ?: emptyList()
                    val processedList = processHistoryList(historyList)

                    // 실제 처리된 리스트의 크기로 보수 이력 개수를 업데이트
                    maintCountTextView.text = "보수 이력 : ${processedList.size}건"
                    viewModel.updateHistoryList(historyList)  // 데이터를 ViewModel로 업데이트
                } else {
                    Log.e("CableMaintListActivity", "Failed to fetch history: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<CableHistoryData>>, t: Throwable) {
                Log.e("CableMaintListActivity", "Error fetching history: ${t.message}")
            }
        })
    }

    private fun setupRecyclerView(processedList: List<CableHistoryData>) {
        maintListRecyclerView.adapter = MaintHistoryAdapter(processedList)
    }

    // 포설 및 제거 항목을 개별 항목으로 분리하는 함수
    private fun processHistoryList(historyList: List<CableHistoryData>): List<CableHistoryData> {
        val processedList = mutableListOf<CableHistoryData>()

        for (history in historyList) {
            // 포설된 항목 추가
            if (history.connectDate != null) {
                processedList.add(
                    CableHistoryData(
                        userId = history.userId,
                        cableIdx = history.cableIdx,
                        connectUserName = history.connectUserName,
                        removeUserName = null,
                        connectDate = history.connectDate,
                        removeDate = null
                    )
                )
            }

            // 제거된 항목 추가
            if (history.removeDate != null) {
                processedList.add(
                    CableHistoryData(
                        userId = history.userId,
                        cableIdx = history.cableIdx,
                        connectUserName = null,
                        removeUserName = history.removeUserName,
                        connectDate = null,
                        removeDate = history.removeDate
                    )
                )
            }
        }

        // 리스트를 날짜 기준으로 정렬
        return processedList.sortedWith(compareByDescending {
            it.connectDate ?: it.removeDate
        })
    }

    private fun openback() {
        finish()
    }
}

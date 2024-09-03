package com.qrancae.mobile.model

import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.qrancae.mobile.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class MaintenanceViewModel : ViewModel() {

    private val TAG = "MaintenanceViewModel"

    @RequiresApi(Build.VERSION_CODES.O)
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

    private val _maintenanceTasks = MutableLiveData<List<MaintenanceTask>?>()
    val maintenanceTasks: MutableLiveData<List<MaintenanceTask>?> get() = _maintenanceTasks

    private val _errorMessage = MutableLiveData<String>()
    val errorMessage: LiveData<String> get() = _errorMessage

    private val _selectedTab = MutableLiveData<String>()
    val selectedTab: LiveData<String> get() = _selectedTab

    private var selectedStatus: String = "전체"
    private var selectedSort: String = "최신순"
    private lateinit var userId: String

    fun initialize(userId: String) {
        this.userId = userId
        loadMaintenanceTasks()
    }

    fun loadMaintenanceTasks() {
        Log.d(TAG, "Loading maintenance tasks for UserId: $userId, Status: $selectedStatus, SortBy: $selectedSort")
        RetrofitClient.apiService.getMaintenanceTasks(userId, selectedStatus, selectedSort)
            .enqueue(object : Callback<List<MaintenanceTask>> {
                @RequiresApi(Build.VERSION_CODES.O)
                override fun onResponse(
                    call: Call<List<MaintenanceTask>>,
                    response: Response<List<MaintenanceTask>>
                ) {
                    if (response.isSuccessful) {
                        val tasks = response.body()
                        Log.d(TAG, "Maintenance tasks loaded: $tasks")
                        _maintenanceTasks.value = sortTasksByPriority(tasks ?: emptyList())
                    } else {
                        val error = "Failed to load maintenance tasks: ${response.errorBody()?.string()}"
                        Log.e(TAG, error)
                        _errorMessage.value = error
                    }
                }

                override fun onFailure(call: Call<List<MaintenanceTask>>, t: Throwable) {
                    val error = "Error in fetching maintenance tasks"
                    Log.e(TAG, error, t)
                    _errorMessage.value = error
                }
            })
    }

    fun onTabSelected(status: String) {
        Log.d(TAG, "Tab selected: $status for UserId: $userId")
        selectedStatus = status
        _selectedTab.value = status
        loadMaintenanceTasks()
    }

    fun onSortSelected(sortBy: String) {
        Log.d(TAG, "Sort selected: $sortBy for UserId: $userId")
        selectedSort = sortBy
        loadMaintenanceTasks()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun sortTasksByPriority(tasks: List<MaintenanceTask>): List<MaintenanceTask> {
        return tasks.sortedWith(compareByDescending<MaintenanceTask> {
            when (it.status) {
                "진행중" -> 2
                "신규접수" -> 1
                "보수완료" -> 0
                else -> -1
            }
        }.thenBy { task ->
            val maintDate = LocalDateTime.parse(task.maintDate, formatter)
            if (selectedSort == "최신순") maintDate else maintDate.plusSeconds(0) // 날짜 그대로 사용하여 정렬
        })
    }
}

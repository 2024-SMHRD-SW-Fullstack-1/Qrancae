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
import java.time.format.DateTimeParseException

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
    private var selectedSort: String = "최신순"  // 기본값 최신순
    private lateinit var userId: String

    fun initialize(userId: String) {
        this.userId = userId
        loadMaintenanceTasks()
    }

    fun loadMaintenanceTasks() {
        Log.d(TAG, "Loading maintenance tasks for UserId: $userId, Status: $selectedStatus, SortBy: $selectedSort")

        // sortBy를 포함하여 API 호출
        RetrofitClient.apiService.getMaintenanceTasks(userId, selectedStatus, selectedSort)
            .enqueue(object : Callback<List<MaintenanceTask>> {
                @RequiresApi(Build.VERSION_CODES.O)
                override fun onResponse(call: Call<List<MaintenanceTask>>, response: Response<List<MaintenanceTask>>) {
                    if (response.isSuccessful) {
                        val tasks = response.body()
                        Log.d(TAG, "Maintenance tasks loaded: $tasks")
                        _maintenanceTasks.value = sortTasksByPriority(tasks ?: emptyList())  // 정렬 후 데이터 갱신
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
        val formatterWithSeconds = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
        val formatterWithoutSeconds = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")

        return tasks.sortedWith(compareBy<MaintenanceTask> {
            // 상태별로 우선순위 설정
            when (it.status) {
                "점검중" -> 0  // 가장 우선
                "신규접수" -> 1
                "보수완료" -> 2
                else -> 3  // 기타 상태는 가장 낮은 우선순위
            }
        }.let { comparator ->
            // 최신순일 경우, 날짜 내림차순
            when (selectedSort) {
                "최신순" -> comparator.thenByDescending { task ->
                    parseDate(task.maintDate, formatterWithSeconds, formatterWithoutSeconds)
                }
                // 오래된순일 경우, 날짜 오름차순
                "오래된순" -> comparator.thenBy { task ->
                    parseDate(task.maintDate, formatterWithSeconds, formatterWithoutSeconds)
                }
                else -> comparator
            }
        })
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun parseDate(dateStr: String?, formatterWithSeconds: DateTimeFormatter, formatterWithoutSeconds: DateTimeFormatter): LocalDateTime? {
        return dateStr?.let {
            try {
                LocalDateTime.parse(it, formatterWithSeconds)
            } catch (e: DateTimeParseException) {
                LocalDateTime.parse(it, formatterWithoutSeconds)
            }
        }
    }
}

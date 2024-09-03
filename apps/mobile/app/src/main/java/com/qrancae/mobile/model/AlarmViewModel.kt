package com.qrancae.mobile.model

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.qrancae.mobile.network.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class AlarmViewModel(application: Application) : AndroidViewModel(application) {

    private val _alarms = MutableLiveData<List<AlarmData>?>()
    val alarms: MutableLiveData<List<AlarmData>?> get() = _alarms

    // 알림 데이터 로드
    fun loadAlarms(userId: String) {
        Log.d("AlarmViewModel", "Loading alarms for userId: $userId")
        RetrofitClient.apiService.getAlarms(userId).enqueue(object : Callback<List<AlarmData>> {
            override fun onResponse(call: Call<List<AlarmData>>, response: Response<List<AlarmData>>) {
                if (response.isSuccessful) {
                    val filteredAlarms = response.body()
                    Log.d("AlarmViewModel", "Filtered Alarms: $filteredAlarms")
                    _alarms.value = filteredAlarms
                } else {
                    Log.e("AlarmViewModel", "Failed to load alarms: ${response.errorBody()?.string()}")
                }
            }

            override fun onFailure(call: Call<List<AlarmData>>, t: Throwable) {
                Log.e("AlarmViewModel", "Failed to load alarms", t)
            }
        })
    }
}

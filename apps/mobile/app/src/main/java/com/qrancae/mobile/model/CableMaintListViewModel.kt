package com.qrancae.mobile.model

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.qrancae.mobile.model.CableHistoryData

class CableMaintListViewModel : ViewModel() {
    private val _historyList = MutableLiveData<List<CableHistoryData>>()
    val historyList: LiveData<List<CableHistoryData>> get() = _historyList

    // 데이터를 업데이트하는 함수
    fun updateHistoryList(newHistoryList: List<CableHistoryData>) {
        _historyList.value = newHistoryList
    }
}

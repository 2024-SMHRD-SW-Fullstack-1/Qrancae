package com.qrancae.mobile.model

import com.google.gson.annotations.SerializedName

data class MaintenanceTask(
    val maintCable: String?,
    val maintQr: String?,
    val maintPower: String?,
    @SerializedName("status") val status: String,
    @SerializedName("maintDate") val maintDate: String?,
    @SerializedName("alarmDate") val alarmDate: String?,
    val alarmMsg: String?,
    @SerializedName("srackNumber") val sRackNumber: String?,  // JSON 필드와 매핑
    @SerializedName("srackLocation") val sRackLocation: String?,  // JSON 필드와 매핑
    val cableIdx: String?
)

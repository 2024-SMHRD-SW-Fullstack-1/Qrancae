package com.qrancae.mobile.model

data class MaintenanceData(
    val userId: String,
    val cableIdx: Long,
    val maintCable: String,
    val maintPower: String,
    val maintQr: String,
    val maintDate: String,
    val maintMsg: String,
    val maintStatus: String
)

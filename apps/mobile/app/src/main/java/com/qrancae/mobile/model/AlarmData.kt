package com.qrancae.mobile.model

import com.google.gson.annotations.SerializedName
import java.time.LocalDateTime

data class AlarmData(
    @SerializedName("alarmIdx")
    val alarmIdx: Long,

    @SerializedName("userId")
    val userId: String,

    @SerializedName("maintIdx")
    val maintIdx: Long,

    @SerializedName("alarmMsg")
    val alarmMsg: String,

    @SerializedName("alarmDate")
    val alarmDate: String // LocalDateTime 대신 String으로 변경
)

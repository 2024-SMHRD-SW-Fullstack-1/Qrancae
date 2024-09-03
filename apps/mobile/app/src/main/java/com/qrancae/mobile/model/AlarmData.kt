package com.qrancae.mobile.model

import com.google.gson.annotations.SerializedName
import java.time.LocalDateTime

data class AlarmData(
    @SerializedName("alarm_idx")
    val alarmIdx: Long,

    @SerializedName("user_id")
    val userId: String,

    @SerializedName("maint_idx")
    val maintIdx: Long,

    @SerializedName("alarm_msg")
    val alarmMsg: String,

    @SerializedName("alarm_date")
    val alarmDate: LocalDateTime
)

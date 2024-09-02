package com.qrancae.mobile.model

import com.google.gson.annotations.SerializedName

data class CableData(
    @SerializedName("cableIdx") val cableIdx: Long,
    @SerializedName("cableDate") val cableDate: String?,
)

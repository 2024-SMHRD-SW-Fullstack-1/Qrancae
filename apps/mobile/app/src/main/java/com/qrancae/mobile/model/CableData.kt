package com.qrancae.mobile.model

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class CableData(
    @SerializedName("cableIdx") val cableIdx: Long?,
    @SerializedName("srackNumber") val sRackNumber: String?,
    @SerializedName("srackLocation") val sRackLocation: String?,
    @SerializedName("sserverName") val sServerName: String?,
    @SerializedName("sportNumber") val sPortNumber: String?,
    @SerializedName("drackNumber") val dRackNumber: String?,
    @SerializedName("drackLocation") val dRackLocation: String?,
    @SerializedName("dserverName") val dServerName: String?,
    @SerializedName("dportNumber") val dPortNumber: String?,
    @SerializedName("installDate") val installDate: String?
) : Serializable // Serializable을 구현


package com.qrancae.mobile.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("userId") val user_id: String,
    @SerializedName("userPw") val user_pw: String,
    @SerializedName("userName") val user_name: String? = null
)

package com.qrancae.mobile.repository

import com.qrancae.mobile.model.User
import com.qrancae.mobile.network.RetrofitClient
import retrofit2.Call

class UserRepository {
    fun loginUser(user: User): Call<User> {
        return RetrofitClient.apiService.loginUser(user)
    }
}

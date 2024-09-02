package com.qrancae.mobile.network

import com.qrancae.mobile.model.CableData
import com.qrancae.mobile.model.LogData
import com.qrancae.mobile.model.MaintStatusResponse
import com.qrancae.mobile.model.User
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @POST("app/login")
    fun loginUser(@Body user: User): Call<User>

    @POST("app/api/logs")
    fun saveLog(@Body logData: LogData): Call<Void>

    @GET("app/api/cables/{cableIdx}")
    fun getCableDate(@Path("cableIdx") cableIdx: Long) : Call<CableData>

    @GET("app/api/maint-status/{userId}")
    fun getMaintenanceStatus(@Path("userId") userId: String) : Call<MaintStatusResponse>
}

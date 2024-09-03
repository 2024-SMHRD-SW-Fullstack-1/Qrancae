package com.qrancae.mobile.network

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class RetrofitClient private constructor() {
    companion object {
        private const val BASE_URL = "http://192.168.219.42:8089/qrancae/"

        private val retrofit: Retrofit by lazy {

            val gson : Gson = GsonBuilder()
                .setLenient()
                .create()

            Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
        }

        val apiService: ApiService by lazy {
            retrofit.create(ApiService::class.java)
        }
    }
}

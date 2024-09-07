package com.qrancae.mobile.network

import com.qrancae.mobile.model.AlarmData
import com.qrancae.mobile.model.CableData
import com.qrancae.mobile.model.CableHistoryData
import com.qrancae.mobile.model.LogData
import com.qrancae.mobile.model.MaintStatusResponse
import com.qrancae.mobile.model.MaintenanceData
import com.qrancae.mobile.model.MaintenanceTask
import com.qrancae.mobile.model.User
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // LoginAcitivity에서 사용하는 API
    // 로그인 시 사용자 정보를 서버로 전달하고, 사용자 객체(User)를 반환
    @POST("app/login")
    fun loginUser(@Body user: User): Call<User>


    // 케이블 연결 기록을 확인하는 API (연결 여부를 Boolean으로 반환)
    @GET("app/api/cable-history/check")
    fun checkCableHistory(@Query("cableIdx") cableIdx: Long): Call<Boolean>

    @FormUrlEncoded
    @POST("app/api/cable-history/connect")
    fun saveCableInstallation(
        @Field("cableIdx") cableIdx: Long,
        @Field("userId") userId: String
    ): Call<Void>

    // 로그 데이터(LogData)를 서버에 전송하여 저장
    @POST("app/api/logs")
    fun saveLog(@Body logData: LogData): Call<Void>

    // 특정 케이블의 인덱스(cableIdx)로 케이블 정보를 서버에서 가져옴
    @GET("app/api/cables/{cableIdx}")
    fun getCableDate(@Path("cableIdx") cableIdx: Long) : Call<CableData>



    // 케이블 인덱스를 기준으로 유지보수 상태(점검 중, 접수 가능 등)를 확인
    @GET("app/api/maintenance/checkMaintenanceStatus")
    fun checkMaintenanceStatus(@Query("cableIdx") cableIdx: Long): Call<Map<String, String>>

    // 유지보수 데이터를 서버에 제출, 보수 정보를 저장
    @POST("app/api/maintenance/submit")
    fun submitMaintenance(@Body maintenanceData: MaintenanceData): Call<Void>

    // 특정 사용자의 알림 목록을 가져옴
    @GET("app/api/alarm/list")
    fun getAlarms(@Query("userId") userId: String): Call<List<AlarmData>>

    // 케이블 제거 API 호출 정의
    @POST("app/api/cables/remove")
    fun removeCable(
        @Query("cableIdx") cableIdx: Long,
        @Query("userId") userId: String
    ): Call<Void>

    // 사용자 ID와 케이블 인덱스를 기반으로 유지보수 항목의 인덱스를 가져옴, 필요한 경우 새로 생성
    @GET("app/api/maint-idx")
    fun getMaintIdx(
        @Query("userId") userId: String,
        @Query("cableIdx") cableIdx: Int,
        @Query("forceCreate") forceCreate: Boolean
    ): Call<Map<String, Int>>  // 수정된 부분: Map으로 응답을 받음


    // MaintListActivity에서 사용하는 API
    // 특정 사용자에 대한 유지보수 작업 목록을 상태와 정렬 기준에 따라 가져옴
    @GET("app/api/maintenance/tasks")
    fun getMaintenanceTasks(
        @Query("userId") userId: String,  // 사용자 ID
        @Query("status") status: String,  // 상태 (예: 점검 중, 완료)
        @Query("sortBy") sortBy: String   // 정렬 기준 (예: 최신순, 오래된순)
    ): Call<List<MaintenanceTask>>

    // 특정 사용자의 유지보수 상태(진행 중, 완료된 항목 등)를 가져옴
    @GET("app/api/maint-status/{userId}")
    fun getMaintenanceStatus(@Path("userId") userId: String) : Call<MaintStatusResponse>

    // 유지보수 항목의 ID와 사용자 ID를 기반으로 특정 알림 메시지를 가져옴
    @GET("app/api/alarm/message")
    fun getAlarmByMaintIdx(
        @Query("maintIdx") maintIdx: Long,
        @Query("userId") userId: String
    ): Call<Map<String, String>>

    // 케이블 유지보수 내역 조회
    @GET("app/api/cable-history/{cableIdx}")
    fun getCableHistory(
        @Path("cableIdx") cableIdx: Long
    ): Call<List<CableHistoryData>>

}

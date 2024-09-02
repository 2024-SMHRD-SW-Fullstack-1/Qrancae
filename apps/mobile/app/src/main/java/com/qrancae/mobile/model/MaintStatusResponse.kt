package com.qrancae.mobile.model

data class MaintStatusResponse(
    val newEntryCount: Int,
    val inProgressCount: Int,
    val completedCount: Int
)
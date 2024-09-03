package com.qrancae.mobile.util

import java.text.SimpleDateFormat
import java.util.*

fun formatDateTime(dateTime: String?): String? {
    return if (dateTime != null) {
        try {
            // 입력 문자열을 Date 객체로 파싱
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val date = inputFormat.parse(dateTime)

            // 원하는 출력 형식으로 변환
            val outputFormat = SimpleDateFormat("yyyy.MM.dd HH시 mm분", Locale.getDefault())
            outputFormat.format(date)
        } catch (e: Exception) {
            dateTime // 파싱 실패 시 원래 문자열 반환
        }
    } else {
        null
    }
}

package com.qrancae.mobile.util

import android.view.MotionEvent
import android.view.View

object TouchEffectUtil {
    fun applyTouchEffect(view: View, onClickAction: () -> Unit) {
        view.setOnTouchListener { v, motionEvent ->
            when (motionEvent.action) {
                MotionEvent.ACTION_DOWN -> {
                    // 뷰가 눌렸을 때 크기를 살짝 줄이고 투명도를 조정
                    v.scaleX = 0.98f
                    v.scaleY = 0.98f
                    v.alpha = 0.95f // 반투명하게 변경
                }
                MotionEvent.ACTION_UP -> {
                    // 손을 뗐을 때 원래 크기로 복원하고, 클릭 액션 실행
                    v.scaleX = 1.0f
                    v.scaleY = 1.0f
                    v.alpha = 1.0f // 원래 투명도로 복원
                    onClickAction() // 클릭 액션 실행
                }
                MotionEvent.ACTION_CANCEL -> {
                    // 사용자가 취소했을 때도 원래 크기로 복원
                    v.scaleX = 1.0f
                    v.scaleY = 1.0f
                    v.alpha = 1.0f
                }
            }
            true
        }
    }
}
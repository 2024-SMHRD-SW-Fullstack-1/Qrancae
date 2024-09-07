package com.qrancae.mobile.util

import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.animation.AnimationUtils
import com.qrancae.mobile.R

object ButtonAnimationUtil {
    fun applyButtonAnimation(view: View, context: Context, onClickAction: () -> Unit) {
        view.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.startAnimation(AnimationUtils.loadAnimation(context, R.anim.button_shrink))
                }
                MotionEvent.ACTION_UP -> {
                    v.startAnimation(AnimationUtils.loadAnimation(context, R.anim.button_expand))
                    onClickAction()
                }
                MotionEvent.ACTION_CANCEL -> {
                    v.startAnimation(AnimationUtils.loadAnimation(context, R.anim.button_expand))
                }
            }
            true
        }
    }
}

package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.animation.AnimationUtils
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.util.ButtonAnimationUtil

class SettingActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_setting)

        // 뒤로가기 버튼 설정
        val backButton: ImageView = findViewById(R.id.iv_back)
        ButtonAnimationUtil.applyButtonAnimation(backButton,this) {
            openMain()
        }
    }

    // MainActivity로 이동하는 메서드
    private fun openMain() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }
}

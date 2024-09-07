package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import com.qrancae.mobile.model.User
import com.qrancae.mobile.repository.UserRepository
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    private lateinit var etLoginId: EditText
    private lateinit var etLoginPw: EditText
    private lateinit var btnLogin: Button
    private val userRepository = UserRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etLoginId = findViewById(R.id.et_Id)
        etLoginPw = findViewById(R.id.et_Pw)
        btnLogin = findViewById(R.id.btn_Login)

        // 로그인 버튼에 클릭 리스너 추가
        btnLogin.setOnClickListener {
            val userId = etLoginId.text.toString()
            val userPw = etLoginPw.text.toString()

            val user = User(user_id = userId, user_pw = userPw)
            loginUser(user)
        }

        // 로그인 버튼에 눌림 효과 적용
        btnLogin.setOnTouchListener { view, motionEvent ->
            when (motionEvent.action) {
                MotionEvent.ACTION_DOWN -> {
                    // 눌렀을 때 크기를 줄여서 눌림 효과 적용
                    view.scaleX = 0.97f
                    view.scaleY = 0.97f
                    view.alpha = 0.8f // 살짝 반투명하게 변경
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    // 손을 뗐을 때 원래 크기로 복원
                    view.scaleX = 1.0f
                    view.scaleY = 1.0f
                    view.alpha = 1.0f // 원래 투명도로 복원
                }
            }
            false
        }
    }

    private fun loginUser(user: User) {
        userRepository.loginUser(user).enqueue(object : Callback<User> {
            override fun onResponse(call: Call<User>, response: Response<User>) {
                if (response.isSuccessful) {
                    val loggedInUser = response.body()
                    if (loggedInUser != null) {
                        // SharedPreferences에 userName 저장
                        val sharedPref = getSharedPreferences("USER_PREFS", MODE_PRIVATE)
                        with(sharedPref.edit()) {
                            putString("userId", loggedInUser.user_id)
                            putString("userName", loggedInUser.user_name)
                            apply()
                        }

                        Toast.makeText(this@LoginActivity, "로그인 성공", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "로그인 실패: 서버에서 유효하지 않은 데이터를 반환했습니다.", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@LoginActivity, "로그인 실패: 서버 응답 코드 - ${response.code()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<User>, t: Throwable) {
                Toast.makeText(this@LoginActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}

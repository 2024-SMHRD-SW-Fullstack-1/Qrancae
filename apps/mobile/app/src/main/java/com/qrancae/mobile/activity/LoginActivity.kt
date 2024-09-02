package com.qrancae.mobile.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
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

        btnLogin.setOnClickListener {
            val userId = etLoginId.text.toString()
            val userPw = etLoginPw.text.toString()

            val user = User(user_id = userId, user_pw = userPw)
            loginUser(user)
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

package com.qrancae.mobile.activity

import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.qrancae.mobile.R
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

class CableMaintAddActivity : AppCompatActivity() {

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cable_maint_add)

        val currentDate = LocalDateTime.now()
        val formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd(E)", Locale.KOREA)
        val formattedDate = currentDate.format(formatter)
        findViewById<TextView>(R.id.tv_date).text =formattedDate


        val buttons = listOf(
            findViewById<Button>(R.id.btn_cable),
            findViewById<Button>(R.id.btn_power),
            findViewById<Button>(R.id.btn_qr),
            findViewById<Button>(R.id.btn_no_issues)
        )

        buttons.forEach { button ->
            button.setOnClickListener {
                toggleButtonState(it as Button)
            }
        }
    }

    private fun toggleButtonState(button: Button) {
        val isChecked = button.tag as? Boolean ?: false

        if (!isChecked) {
            button.setBackgroundResource(R.drawable.rounded_button_checked)
            button.setTextColor(Color.parseColor("#FFFFFF"))
            button.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check_white, 0, 0, 0)
        } else {
            button.setBackgroundResource(R.drawable.rounded_button_check)
            button.setTextColor(Color.parseColor("#A5A5A5"))
            button.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
        }

        button.tag = !isChecked
    }
}

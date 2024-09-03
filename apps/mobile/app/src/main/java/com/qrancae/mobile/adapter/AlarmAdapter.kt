package com.qrancae.mobile.adapter

import android.os.Build
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.annotation.RequiresApi
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qrancae.mobile.databinding.ItemAlarmBinding
import com.qrancae.mobile.model.AlarmData
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class AlarmAdapter(private val onClick: (AlarmData) -> Unit) : ListAdapter<AlarmData, AlarmAdapter.AlarmViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlarmViewHolder {
        val binding = ItemAlarmBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return AlarmViewHolder(binding)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onBindViewHolder(holder: AlarmViewHolder, position: Int) {
        holder.bind(getItem(position), onClick)
    }

    class AlarmViewHolder(private val binding: ItemAlarmBinding) : RecyclerView.ViewHolder(binding.root) {
        @RequiresApi(Build.VERSION_CODES.O)
        fun bind(alarm: AlarmData, onClick: (AlarmData) -> Unit) {
            binding.tvAlarmMessage.text = "새로운 작업이 발생하였습니다."

            // Null check before parsing the date
            val alarmDateString = alarm.alarmDate?.toString()

            if (alarmDateString != null) {
                val dateTime = LocalDateTime.parse(alarmDateString)
                val formattedDate = dateTime.format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"))
                binding.tvAlarmDate.text = formattedDate
            } else {
                binding.tvAlarmDate.text = "날짜 없음"  // Null일 경우 기본 텍스트 설정
            }

            binding.root.setOnClickListener { onClick(alarm) }
        }
    }

    companion object {
        private val DiffCallback = object : DiffUtil.ItemCallback<AlarmData>() {
            override fun areItemsTheSame(oldItem: AlarmData, newItem: AlarmData): Boolean =
                oldItem.alarmIdx == newItem.alarmIdx

            override fun areContentsTheSame(oldItem: AlarmData, newItem: AlarmData): Boolean =
                oldItem == newItem
        }
    }
}

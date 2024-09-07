package com.qrancae.mobile.adapter

import android.text.TextUtils
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.qrancae.mobile.R
import com.qrancae.mobile.model.MaintenanceTask
import com.qrancae.mobile.util.formatDateTime

class MaintenanceTaskAdapter(private var tasks: List<MaintenanceTask>) :
    RecyclerView.Adapter<MaintenanceTaskAdapter.MaintenanceTaskViewHolder>() {

    private val TAG = "MaintenanceTaskAdapter"

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MaintenanceTaskViewHolder {
        val itemView =
            LayoutInflater.from(parent.context).inflate(R.layout.item_progress, parent, false)
        return MaintenanceTaskViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: MaintenanceTaskViewHolder, position: Int) {
        Log.d(TAG, "Binding task at position: $position")
        holder.bind(tasks[position])
    }

    override fun getItemCount(): Int = tasks.size

    fun updateTasks(newTasks: List<MaintenanceTask>) {
        this.tasks = newTasks
        notifyDataSetChanged()
    }

    class MaintenanceTaskViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val taskTitle: TextView = itemView.findViewById(R.id.tv_task_title)
        private val taskDescription: TextView = itemView.findViewById(R.id.tv_task_description)
        private val taskDetails: TextView = itemView.findViewById(R.id.tv_task_details)
        private val status: TextView = itemView.findViewById(R.id.tv_status)
        private val date: TextView = itemView.findViewById(R.id.tv_date)

        fun bind(task: MaintenanceTask) {
            val issues = mutableListOf<String>()
            if (task.maintCable == "불량") issues.add("케이블 불량")
            if (task.maintQr == "불량") issues.add("QR 불량")
            if (task.maintPower == "불량") issues.add("전원 불량")

            var title = if (issues.isNotEmpty()) issues.joinToString(", ") else "정기점검 이상 무"

            if (title.length > 10) {
                title = TextUtils.ellipsize(title, taskTitle.paint, 10 * taskTitle.textSize, TextUtils.TruncateAt.END).toString()
            }
            taskTitle.text = title

            taskDescription.text = when (task.status) {
                "신규접수" -> task.maintMsg ?: "특이사항이 없습니다."  // 신규 접수 상태에서는 maint_msg를 보여줌
                "점검중" -> task.alarmMsg
                "보수완료" -> "유지보수가 완료되었습니다. 점검 결과: 정상"  // 보수 완료 시 메시지
                else -> "상태 정보 없음"
            }
            taskDetails.text =
                "랙 번호: ${task.sRackNumber}, 위치: ${task.sRackLocation}, 케이블 번호: ${task.cableIdx}"

            val formattedDate = formatDateTime(task.maintDate) ?: "날짜 없음"
            date.text = formattedDate
            status.text = task.status

            // 상태에 따라 텍스트 색상과 배경 변경
            when (task.status) {
                "점검중" -> {
                    status.setTextColor(ContextCompat.getColor(itemView.context, R.color.gray))
                    status.setBackgroundResource(R.drawable.rounded_border_progress)
                }

                "보수완료" -> {
                    status.setTextColor(ContextCompat.getColor(itemView.context, R.color.purple))
                    status.setBackgroundResource(R.drawable.rounded_border_completed)
                }

                else -> {
                    status.setTextColor(ContextCompat.getColor(itemView.context, R.color.green))
                    status.setBackgroundResource(R.drawable.rounded_border_new)
                }
            }
        }
    }
}

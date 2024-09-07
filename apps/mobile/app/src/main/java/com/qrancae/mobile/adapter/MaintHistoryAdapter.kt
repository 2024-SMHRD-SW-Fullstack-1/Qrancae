package com.qrancae.mobile.activity

import android.os.Build
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.recyclerview.widget.RecyclerView
import com.qrancae.mobile.R
import com.qrancae.mobile.model.CableHistoryData
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class MaintHistoryAdapter(private val historyList: List<CableHistoryData>) :
    RecyclerView.Adapter<MaintHistoryAdapter.MaintHistoryViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MaintHistoryViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_maint_history, parent, false)
        return MaintHistoryViewHolder(view)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onBindViewHolder(holder: MaintHistoryViewHolder, position: Int) {
        val history = historyList[position]

        // connectDate가 있으면 포설된 기록으로 표시
        if (history.connectDate != null) {
            holder.bind(
                userName = history.connectUserName ?: "N/A",
                actionText = "(포설됨)",
                dateText = formatDate(history.connectDate)
            )
        }

        // removeDate가 있으면 제거된 기록으로 추가 표시
        if (history.removeDate != null) {
            holder.bind(
                userName = history.removeUserName ?: "N/A",
                actionText = "(제거됨)",
                dateText = formatDate(history.removeDate)
            )
        }
    }

    override fun getItemCount(): Int {
        // 포설 기록과 제거 기록을 각각 개별 항목으로 처리하므로,
        // connectDate 또는 removeDate가 있는 항목들은 각각 카운트해야 함.
        return historyList.sumBy { history ->
            var count = 0
            if (history.connectDate != null) count += 1
            if (history.removeDate != null) count += 1
            count
        }
    }

    class MaintHistoryViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val userNameTextView: TextView = itemView.findViewById(R.id.tv_username)
        private val actionTextView: TextView = itemView.findViewById(R.id.tv_action)
        private val dateTextView: TextView = itemView.findViewById(R.id.tv_date)

        fun bind(userName: String, actionText: String, dateText: String) {
            userNameTextView.text = userName
            actionTextView.text = actionText
            dateTextView.text = dateText
        }
    }

    // 날짜 형식 변환 함수
    @RequiresApi(Build.VERSION_CODES.O)
    private fun formatDate(dateString: String?): String {
        return if (dateString != null) {
            val formatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분")
            val dateTime = LocalDateTime.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            dateTime.format(formatter)
        } else {
            "N/A"
        }
    }
}

package com.qrancae.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tb_alarm")
public class AlarmData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alarm_idx")
    private Integer alarmIdx;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "maint_idx", nullable = false)
    private Integer maintIdx;

    @Column(name = "alarm_msg", nullable = false, length = 50)
    private String alarmMsg;

    @Column(name = "alarm_date", nullable = false)
    private LocalDateTime alarmDate;
}

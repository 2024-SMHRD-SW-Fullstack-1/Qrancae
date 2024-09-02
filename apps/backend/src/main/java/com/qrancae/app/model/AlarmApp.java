//package com.qrancae.app.model;
//
//import java.time.LocalDateTime;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.FetchType;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.ManyToOne;
//import jakarta.persistence.Table;
//import lombok.Data;
//
//@Data
//@Entity
//@Table(name = "tb_alarm")
//public class AlarmApp {
//
//	@Id
//	@GeneratedValue(strategy = GenerationType.IDENTITY)
//	private Long alarmIdx;
//
//	@Column(name = "user_id")
//	private String userId;
//
//	@Column(name = "alarm_msg")
//	private String alarmMsg;
//
//	@Column(name = "alarm_date")
//	private LocalDateTime alarmDate;
//
//	@ManyToOne(fetch = FetchType.LAZY)
//	@JoinColumn(name = "maint_idx", referencedColumnName = "maint_idx")
//	private Maintenance maintenance;
//
//}

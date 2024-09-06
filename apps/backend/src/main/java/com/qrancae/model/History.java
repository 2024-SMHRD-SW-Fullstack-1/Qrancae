package com.qrancae.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_cable_history")
@Data
public class History {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "history_idx")
	private Integer history_idx;
	
	@Column(name = "cable_idx")
	private Integer cable_idx;
	
	@Column(name = "connect_user_id", length = 50)
	private String connect_user_id;
	
	@Column(name = "remove_user_id", length = 50)
	private String remove_user_id;
	
	@Column(name = "connect_date")
	private LocalDateTime connect_date;
	
	@Column(name = "remove_date")
	private LocalDateTime remove_date;
}

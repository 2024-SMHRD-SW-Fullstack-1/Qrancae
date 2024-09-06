package com.qrancae.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "connect_user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
	private User connectUser;
	
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "remove_user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
	private User removeUser;

	@Column(name = "connect_date")
	private LocalDateTime connect_date;

	@Column(name = "remove_date")
	private LocalDateTime remove_date;
}

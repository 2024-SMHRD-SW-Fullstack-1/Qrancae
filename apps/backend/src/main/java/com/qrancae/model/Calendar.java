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
@Table(name="tb_calendar")
@Data
public class Calendar {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "calendar_idx")
	private Integer calendar_idx;
	
	@Column(name = "user_id", length = 50)
	private String user_id;
	
	@Column(name = "calendar_title", length = 50)
	private String calendar_title;
	
	@Column(name = "calendar_start")
	private LocalDateTime calendar_start;
	
	@Column(name = "calendar_end")
	private LocalDateTime calendar_end;
	
	@Column(name = "calendar_content", length = 100)
	private String calendar_content;
	
	@Column(name = "calendar_color", length = 50)
	private String calendar_color;
	
	@Column(name = "calendar_allday", length = 1)
	private String calendar_allday;
}

package com.qrancae.model;

import java.sql.Timestamp;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_qr")
@Data
public class Qr {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "qr_idx")
	private Integer qr_idx;

	@Column(name = "cable_idx")
	private Integer cable_idx;

	@Column(name = "qr_data", length = 1000)
	private String qr_data;

	@Column(name = "qr_date")
	private LocalDateTime qr_date;

	@Column(name = "qr_status", length = 1)
	private String qr_status;
	
	@PrePersist
    public void prePersist() {
        if (qr_date == null) {
            qr_date = LocalDateTime.now();
        }
        if (qr_status == null) {
            qr_status = "X";
        }
    }
}

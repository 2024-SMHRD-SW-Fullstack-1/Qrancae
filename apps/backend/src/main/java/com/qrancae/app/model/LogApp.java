package com.qrancae.app.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "tb_log")
public class LogApp {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_idx")
    private Integer logIdx;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "cable_idx", nullable = false, length = 50)
    private Integer cableIdx;

    @Column(name = "log_date", nullable = false)
    private LocalDateTime logDate = LocalDateTime.now();
}

package com.qrancae.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Entity
@Table(name = "tb_maintenance")
public class MaintenanceData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maint_idx")
    private Long maintIdx;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "cable_idx", nullable = false)
    private Integer cableIdx;

    @Column(name = "maint_cable",length = 2)
    private String maintCable;

    @Column(name = "maint_power",length = 2)
    private String maintPower;

    @Column(name = "maint_qr",length = 2)
    private String maintQr;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "maint_date", nullable = false)
    private LocalDateTime maintDate;

    @Column(name = "maint_msg",length = 100)
    private String maintMsg;

    @Column(name = "maint_status", nullable = false, length = 20)
    private String maintStatus;
}


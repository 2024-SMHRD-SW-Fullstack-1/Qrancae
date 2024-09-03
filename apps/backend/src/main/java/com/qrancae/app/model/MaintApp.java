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
@Table(name = "tb_maintenance")
public class MaintApp {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maint_idx")
    private Integer maintIdx;  // 변경됨
	
	@Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "maint_status", nullable = false, length = 20)
    private String maintStatus;
    
    @Column(name = "maint_user_id", length = 50)
    private String maintUserId;
    
    @Column(name = "maint_date", nullable = false)
    private LocalDateTime maintDate = LocalDateTime.now();
    
    @Column(name = "cable_idx", nullable = false)
    private Integer cableIdx;  // cableIdx 추가
    
    @Column(name = "maint_update")
    private LocalDateTime maintUpdate;

    @Column(name = "maint_cable", length = 2)
    private String maintCable;

    @Column(name = "maint_power", length = 2)
    private String maintPower;

    @Column(name = "maint_qr", length = 2)
    private String maintQr;

    @Column(name = "maint_msg", length = 100)
    private String maintMsg;

    
}

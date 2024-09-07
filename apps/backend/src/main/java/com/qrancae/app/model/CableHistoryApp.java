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
@Table(name = "tb_cable_history")
public class CableHistoryApp {
	
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "history_idx")
    private Integer historyIdx;

    @Column(name = "cable_idx")
    private Integer cableIdx;

    @Column(name = "connect_user_id", length = 50)
    private String connectUserId;

    @Column(name = "remove_user_id", length = 50)
    private String removeUserId;

    @Column(name = "connect_date")
    private LocalDateTime connectDate;

    @Column(name = "remove_date")
    private LocalDateTime removeDate;

}

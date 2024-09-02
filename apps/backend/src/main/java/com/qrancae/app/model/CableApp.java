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
@Table(name = "tb_cable")
public class CableApp {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cable_idx")
    private Integer cableIdx;

    @Column(name = "s_rack_number", length = 50)
    private String sRackNumber;

    @Column(name = "s_rack_location", length = 50)
    private String sRackLocation;

    @Column(name = "s_server_name", length = 50)
    private String sServerName;

    @Column(name = "s_port_number", length = 50)
    private String sPortNumber;

    @Column(name = "d_rack_number", length = 50)
    private String dRackNumber;

    @Column(name = "d_rack_location", length = 50)
    private String dRackLocation;

    @Column(name = "d_server_name", length = 50)
    private String dServerName;

    @Column(name = "d_port_number", length = 50)
    private String dPortNumber;

    @Column(name = "cable_date")
    private LocalDateTime cableDate;
    
    public void setCableDate(LocalDateTime cableDate) {
        this.cableDate = cableDate;
    }
}

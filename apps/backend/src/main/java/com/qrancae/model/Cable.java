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
@Table(name = "tb_cable")
@Data
public class Cable {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "cable_idx")
	private Integer cable_idx;
	
	@Column(name = "s_rack_number", length = 50)
	private String s_rack_number;
	
	@Column(name = "s_rack_location", length = 50)
	private String s_rack_location;
	
	@Column(name = "s_server_name", length = 50)
	private String s_server_name;
	
	@Column(name = "s_port_number", length = 50)
	private String s_port_number;
	
	@Column(name = "d_rack_number", length = 50)
	private String d_rack_number;
	
	@Column(name = "d_rack_location", length = 50)
	private String d_rack_location;
	
	@Column(name = "d_server_name", length = 50)
	private String d_server_name;
	
	@Column(name = "d_port_number", length = 50)
	private String d_port_number;
	
    @Column(name = "installation_date")
    private LocalDateTime installation_date;
}

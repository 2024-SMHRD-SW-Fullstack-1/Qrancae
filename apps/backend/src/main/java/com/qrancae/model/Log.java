package com.qrancae.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
<<<<<<< HEAD
import jakarta.persistence.Transient;
=======
>>>>>>> 5618cc1f3cef0b6bd4ec0bd39fea2dc648c97072
import lombok.Data;

@Entity
@Table(name="tb_log")
@Data
public class Log {
<<<<<<< HEAD
   
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "log_idx")
   private Integer log_idx;
   
   @ManyToOne
   @JoinColumn(name = "user_id", referencedColumnName = "user_id")
   private User user;
   
   @ManyToOne
   @JoinColumn(name = "cable_idx", referencedColumnName = "cable_idx")
   private Cable cable;
   
   @Column(name = "log_date")
   private LocalDateTime log_date;

}
=======
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "log_idx")
	private Integer log_idx;
	
	@ManyToOne
	@JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
	private User user;
	
	@ManyToOne
	@JoinColumn(name = "cable_idx", referencedColumnName = "cable_idx", insertable = false, updatable = false)
	private Cable cable;
	
	@Column(name = "log_date")
	private LocalDateTime log_date;

}
>>>>>>> 5618cc1f3cef0b6bd4ec0bd39fea2dc648c97072

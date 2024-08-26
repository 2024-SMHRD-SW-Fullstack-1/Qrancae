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
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(name="tb_log")
@Data
public class Log {
   
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
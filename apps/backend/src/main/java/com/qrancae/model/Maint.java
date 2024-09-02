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
import lombok.Data;

@Entity
@Table(name="tb_maintenance")
@Data
public class Maint {
   
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "maint_idx")
   private Integer maint_idx;
   
   @ManyToOne
   @JoinColumn(name = "user_id", referencedColumnName = "user_id")
   private User user;
   
   @ManyToOne
   @JoinColumn(name = "cable_idx", referencedColumnName = "cable_idx")
   private Cable cable;
   
   @Column(name = "maint_qr",length = 2)
   private String maint_qr;
   
   @Column(name = "maint_cable",length = 2)
   private String maint_cable;
   
   @Column(name = "maint_power",length = 2)
   private String maint_power;
   
   @Column(name = "maint_date")
   private LocalDateTime maint_date;
   
   @ManyToOne
   @JoinColumn(name = "maint_user_id", referencedColumnName = "user_id")
   private User maintUser;
   
   @Column(name = "maint_update")
   private LocalDateTime maint_update;
   
   @Column(name = "maint_advice", length = 10)
   private String maintAdvice;
}

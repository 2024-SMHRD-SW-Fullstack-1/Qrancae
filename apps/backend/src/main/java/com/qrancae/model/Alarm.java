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
@Table(name="tb_alarm")
@Data
public class Alarm {
   
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   @Column(name = "alarm_idx")
   private Integer alarm_idx;
   
   @ManyToOne
   @JoinColumn(name = "user_id", referencedColumnName = "user_id")
   private User user;
   
   @ManyToOne
   @JoinColumn(name = "maint_idx", referencedColumnName = "maint_idx")
   private Maint maint;
   
   @Column(name = "alarm_msg",length =50)
   private String alarm_msg;
   
   @Column(name = "alarm_date")
   private LocalDateTime alarm_date;
}

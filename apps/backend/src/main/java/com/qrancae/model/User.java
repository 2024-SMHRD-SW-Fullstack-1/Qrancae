package com.qrancae.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "tb_user")
@Data
public class User {
   
   @Id
   @Column(name = "user_id", length = 50)
   private String user_id;
   
   @Column(name = "user_pw", length = 50)
   private String user_pw;
   @Column(name = "user_name", length = 50)
   private String user_name;
   
   @Column(name = "joined_at")
   private LocalDateTime joined_at;
   @Column(name = "user_type",length = 1)
   private String user_type;
   

}

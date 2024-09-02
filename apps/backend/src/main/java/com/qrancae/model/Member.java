package com.qrancae.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tb_user")
public class Member {

    @Id
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "user_pw", nullable = false, length = 50)
    private String userPw;

    @Column(name = "user_name", nullable = false, length = 50)
    private String userName;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "user_type", nullable = false, length = 1)
    private char userType;

}
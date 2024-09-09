package com.qrancae.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.qrancae.app.service.UserServiceApp;
import com.qrancae.app.model.UserApp;

@RestController
public class UserControllerApp {
    
    @Autowired
    private UserServiceApp memberService;
    
    @PostMapping("/app/login")
    public ResponseEntity<UserApp> login(@RequestBody UserApp user) {
        UserApp loginUser = memberService.login(user.getUserId(), user.getUserPw());
        if (loginUser != null) {
            return ResponseEntity.ok(loginUser);  // JSON 객체 반환
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
}

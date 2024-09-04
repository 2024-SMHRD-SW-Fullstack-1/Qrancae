package com.qrancae.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Log;
import com.qrancae.model.User;
import com.qrancae.service.LogService;
import com.qrancae.service.MemberService;
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class LogController {
   
   @Autowired
   private LogService logService;
   
   @Autowired
   private MemberService memberService;
   
   @GetMapping("/getlog")
   public List<Log> getLog() {
      
      List<Log> logs = logService.getLogResult();
      //System.out.println("로그데이터"+logs.toString());
      
      return logs;
   }
   
   @GetMapping("/logs/count/{userId}")
   public ResponseEntity<Integer> getLogCountByUserId(@PathVariable String userId) {
       User user = memberService.findUserByUserId(userId); // MemberService에 findUserByUserId 메서드를 추가해야 합니다.
       if (user != null) {
           int logCount = logService.countLogsByUser(user);
           return ResponseEntity.ok(logCount);
       } else {
           return ResponseEntity.notFound().build();
       }
   }

}
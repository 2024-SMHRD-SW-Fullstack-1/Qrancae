package com.qrancae.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.qrancae.app.service.AlarmServiceApp;

@RestController
@RequestMapping("/app/api/alarm")
public class AlarmControllerApp {

    @Autowired
    private AlarmServiceApp alarmService;

    @GetMapping("/message")
    public ResponseEntity<Map<String, String>> getAlarmMessage(
            @RequestParam Long maintIdx, @RequestParam String userId) {
        String alarmMsg = alarmService.getAlarmMessage(maintIdx, userId);

        Map<String, String> response = new HashMap<>();
        if (alarmMsg != null) {
            response.put("message", alarmMsg);
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "알림 메시지가 없습니다.");
            return ResponseEntity.ok(response);
        }
    }
}
package com.qrancae.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.qrancae.app.model.AlarmData;
import com.qrancae.app.service.AlarmServiceApp;

@RestController
@RequestMapping("/app/api/alarm")
public class AlarmControllerApp {

    @Autowired
    private AlarmServiceApp alarmService;

    @GetMapping("/list")
    public ResponseEntity<List<AlarmData>> getAlarmList(@RequestParam String userId) {
        List<AlarmData> alarms = alarmService.getInProgressAlarms(userId);
        return ResponseEntity.ok(alarms);
    }
}
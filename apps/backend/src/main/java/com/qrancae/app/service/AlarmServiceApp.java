package com.qrancae.app.service;

import com.qrancae.app.model.AlarmData;
import com.qrancae.app.repository.AlarmRepositoryApp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AlarmServiceApp {

    @Autowired
    private AlarmRepositoryApp alarmRepository;

    // Method to get alarm messages by maintIdx and userId
    public String getAlarmMessage(Long maintIdx, String userId) {
        System.out.println("Finding alarm for maintIdx: " + maintIdx + ", userId: " + userId);
        AlarmData alarmData = alarmRepository.findByMaintIdxAndUserId(maintIdx, userId);
        System.out.println("Found alarm data: " + alarmData);
        return alarmData != null ? alarmData.getAlarmMsg() : null;
    }

 // Method to get a list of in-progress alarms by userId
    public List<AlarmData> getInProgressAlarms(String userId) {
        return alarmRepository.findAlarmsForUserWithInProgressMaint(userId);
    }
}


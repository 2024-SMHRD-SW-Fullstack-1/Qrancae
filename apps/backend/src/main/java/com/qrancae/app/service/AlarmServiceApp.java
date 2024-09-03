package com.qrancae.app.service;

import com.qrancae.app.model.AlarmData;
import com.qrancae.app.repository.AlarmRepositoryApp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AlarmServiceApp {

    @Autowired
    private AlarmRepositoryApp alarmRepository;

    public String getAlarmMessage(Long maintIdx, String userId) {
        System.out.println("Finding alarm for maintIdx: " + maintIdx + ", userId: " + userId);
        AlarmData alarmData = alarmRepository.findByMaintIdxAndUserId(maintIdx, userId);
        System.out.println("Found alarm data: " + alarmData);
        return alarmData != null ? alarmData.getAlarmMsg() : null;
    }
}

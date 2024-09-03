package com.qrancae.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qrancae.model.Alarm;
import com.qrancae.model.Maint;
import com.qrancae.model.User;
import com.qrancae.repository.AlarmRepository;
import com.qrancae.repository.MaintRepository;
import com.qrancae.repository.UserRepository;

@Service
public class MaintService {
   
   @Autowired
   MaintRepository maintRepository;
   @Autowired
   UserRepository userRepository;
   @Autowired
   AlarmRepository alarmRepository;
   
   // 유지보수 내역 불러오기
   public List<Maint> getMaint(){
      List<Maint> result = maintRepository.findAllWithUser();
      
      return result;
   }
   // 작업자 목록 가져오기
   public List<User> getAllUsers() {
       return maintRepository.findAllUsers();
   }

   // 처리 작업자에게 전송하기
   @Transactional
   public void updateMaintUser(List<Integer> selectedMaints, String selectedUserId,String alarmMsg) {
       User selectedUser = userRepository.findById(selectedUserId)
               .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다: " + selectedUserId));
       
       List<Maint> maintList = new ArrayList<>();
       LocalDateTime now = LocalDateTime.now();
       
       // Maint 엔티티를 사용하여 Alarm 엔티티 생성 및 저장    
       for (Integer maintIdx : selectedMaints) {
           // Maint 업데이트
           int updatedRows = maintRepository.updateMaintUser(maintIdx, selectedUserId);
           if (updatedRows == 0) {
               throw new RuntimeException("유지보수 항목 업데이트 실패: " + maintIdx);
           }

           // Maint 객체 조회
           Maint maint = maintRepository.findById(maintIdx)
                   .orElseThrow(() -> new RuntimeException("유지보수 항목을 찾을 수 없습니다: " + maintIdx));
           
           maintList.add(maint);
       }

       // Alarm 객체 생성 후 저장
       List<Alarm> alarms = new ArrayList<>();
       for (Maint maint : maintList) {
           Alarm alarm = new Alarm();
           alarm.setMaint(maint);
           alarm.setUser(selectedUser);
           alarm.setAlarm_msg(alarmMsg);
           alarm.setAlarm_date(now);
           alarms.add(alarm);
       }
       
       alarmRepository.saveAll(alarms);
   }
}
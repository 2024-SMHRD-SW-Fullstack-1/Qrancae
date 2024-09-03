package com.qrancae.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qrancae.model.Alarm;
import com.qrancae.model.Cable;
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
   
   // 해당 케이블의 모든 유지보수 내역
   public Maint findByCable(Cable cable) {
       return maintRepository.findByCable(cable);
   }
   
   // 유지보수 내역 불러오기
   public List<Maint> getMaint(){
      List<Maint> result = maintRepository.findAllWithUser();
      //System.out.println("유지보수 result :" +result.toString());
      
      return result;
   }
   // 사용자 목록 가져오기
   public List<User> getAllUsers() {
       return maintRepository.findAllUsers();
   }

   
//   // 확인 클릭 시 현재 날짜로 업데이트
//   public void updateMaint(int maintIdx, String userId) {
//      
//      LocalDateTime now = LocalDateTime.now();
//      
//      maintRepository.updateMaint(maintIdx,userId,now);
//   }
   
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
   
   /* 오늘의 점검 */
   // - 신규 내역
   public int cntNewRepair() {
	   return maintRepository.countByMaintDateAndMaintUserIsNull();
   }
   // 진행 중
   public int cntInProgressRepair() {
	   return maintRepository.countByMaintUserIsNotNullAndMaintUpdateIsNull();
   }
   // 보수 완료
   public int cntCompleteRepair() {
	   return maintRepository.countByMaintUserIsNotNullAndMaintUpdateIsNotNull();
   }
   // 보수 완료 시 작업자의 수
   public int cntCompleteUser() {
	   return maintRepository.countDistinctMaintUserIdsForCompletedMaintenance();
   }
   
   /* 이달의 케이블 점검 */
   // 이번 달 총 유지보수 수
   public int countMaintThisMonth() {
	   return maintRepository.countDistinctCablesThisMonth();
   }
   
   // 이번 달에 보수 완료인 케이블의 수
   public int countCablesCompletedThisMonth() {
       return maintRepository.countDistinctCablesCompletedThisMonth();
   }
   
   // 이번 달에 보수 완료한 작업자
   public int countDistinctMaintUserIdsForCompletedMaintenanceThisMonth() {
       return maintRepository.countDistinctMaintUserIdsForCompletedMaintenanceMonth();
   }
   
	/* 케이블 불량률 */
   // 해당 Rack 위치 당 불량 수
   public Map<String, Integer> cntDefectRack(Integer year, Integer month) {
	    Map<String, Integer> defectCounts = new HashMap<>();

	    List<Object[]> sourceDefect = maintRepository.countDefectsBySourceRackLocation(year, month);
	    List<Object[]> destinationDefect = maintRepository.countDefectsByDestinationRackLocation(year, month);

	    for (Object[] record : sourceDefect) {
	        String rackLocation = (String) record[0];
	        Integer defectCount = ((Long) record[1]).intValue();
	        defectCounts.put(rackLocation, defectCounts.getOrDefault(rackLocation, 0) + defectCount);
	    }

	    for (Object[] record : destinationDefect) {
	        String rackLocation = (String) record[0];
	        Integer defectCount = ((Long) record[1]).intValue();
	        defectCounts.put(rackLocation, defectCounts.getOrDefault(rackLocation, 0) + defectCount);
	    }

	    return defectCounts;
	}
   
}
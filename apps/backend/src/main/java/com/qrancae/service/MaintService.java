package com.qrancae.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
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
	@Autowired
	SimpMessagingTemplate messagingTemplate;

	private LocalDateTime lastCheckTime = LocalDateTime.now();
	private Set<LocalDateTime> checkedTimes = new HashSet<>(); // 중복 메시지 방지용

	@Scheduled(fixedRate = 5000) // 5초마다 실행
	public void checkForNewMaints() {
	    LocalDateTime currentTime = LocalDateTime.now();
	    
	    // 마지막 체크 시간 이후에 업데이트된 Maint 목록 조회
	    List<Maint> newMaints = maintRepository.findByMaintUpdateAfter(lastCheckTime);

	    if (!newMaints.isEmpty()) {
	        // 새로운 Maint가 있는 경우, 알림 내용 생성 및 전송
	        for (Maint maint : newMaints) {
	            if (maint != null) {
	                try {
	                    // Maint 객체의 maint_msg를 직접 사용
	                	StringBuilder sb = new StringBuilder();
	                	sb.append("{")
	                	  .append("\"cable_idx\": \"").append(maint.getCable() != null ? maint.getCable().getCable_idx() : "N/A").append("\",")
	                	  .append("\"maint_date\": \"").append(maint.getMaint_date() != null ? maint.getMaint_date().toString() : "N/A").append("\",")
	                	  .append("\"user_name\": \"").append(maint.getUser() != null ? maint.getUser().getUser_name() : "N/A").append("\",")
	                	  .append("\"maint_msg\": \"").append(maint.getMaint_msg() != null ? maint.getMaint_msg().replaceAll("\"", "\\\"") : "N/A").append("\",")
	                	  .append("\"maint_qr\": \"").append(maint.getMaint_qr() != null ? maint.getMaint_qr() : "N/A").append("\",")
	                	  .append("\"maint_cable\": \"").append(maint.getMaint_cable() != null ? maint.getMaint_cable() : "N/A").append("\",")
	                	  .append("\"maint_power\": \"").append(maint.getMaint_power() != null ? maint.getMaint_power() : "N/A").append("\"")
	                	  .append("}");

	                	String notificationMessage = sb.toString();
	                    if (notificationMessage != null) {
	                        System.out.println("알림 메시지: " + notificationMessage);
	                        // 웹소켓을 통해 알림 전송
	                        messagingTemplate.convertAndSend("/topic/notifications", notificationMessage);
	                    } else {
	                        System.err.println("알림 메시지가 null입니다.");
	                    }
	                } catch (Exception e) {
	                    System.err.println("알림 메시지 전송 실패: " + e.getMessage());
	                }
	            } else {
	                System.err.println("Maint 객체가 null입니다.");
	            }
	        }

	        // 최신 maint_update로 lastCheckTime 업데이트
	        lastCheckTime = LocalDateTime.now();

	        // 체크된 시간 업데이트
	        checkedTimes.add(lastCheckTime);
	    } else {
	        // 새로운 Maint가 없고, 이전에 체크한 적이 없는 시간일 때만 메시지 출력
	        if (!checkedTimes.contains(lastCheckTime)) {
	            System.out.println("새로운 Maint 없음");
	            checkedTimes.add(lastCheckTime); // 메시지 출력 후, 시간 추가
	        }
	    }
	    
	    // 모든 checkedTimes가 lastCheckTime을 초과하는 경우, lastCheckTime을 최신 체크된 시간으로 업데이트
	    lastCheckTime = checkedTimes.stream()
	                                .max(LocalDateTime::compareTo)
	                                .orElse(currentTime.minusDays(1)); // 초기값 설정
	}

   
   // 해당 케이블의 모든 유지보수 내역
   public Maint findByCable(Cable cable) {
       return maintRepository.findByCable(cable);
   }
   
   // 유지보수 내역 불러오기
   public List<Maint> getMaint(){
      List<Maint> result = maintRepository.findAllWithUser();
      
      return result;
   }
   // 불량인 유지보수 내역
   public List<Maint> getMaintReq(){
	   List<Maint> result = maintRepository.findAllWithUserAndFaults();
	   
	   return result;
   }
   // 작업자 목록 가져오기
   public List<User> getAllUsers() {
       return maintRepository.findAllUsers();
   }

	// 처리 작업자에게 전송하기
	@Transactional
	public void updateMaintUser(List<Integer> selectedMaints, String selectedUserId, String alarmMsg) {
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
	// 신규알림내역 가져오기
	public List<Maint> getMaintMsg(){
		return maintRepository.findByMaintDateAndMaintUserIsNull();
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

	/* 이번주 케이블 점검 */
	// 이번주 전체 점검 내역
	public List<Maint> todayMaintList() {
		return maintRepository.findMaintsForToday();
	}

	// 이번주 QR 불량
	public int cntQrDefect() {
		return maintRepository.countDefectiveQrThisWeek();
	}

	// 이번주 케이블 불량
	public int cntCableDefect() {
		return maintRepository.countDefectiveCableThisWeek();
	}

	// 이번주 전원 공급 상태 불량
	public int cntPowerDefect() {
		return maintRepository.countDefectivePowerThisWeek();
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

		// 출발지 Rack의 불량 수를 가져옴
		List<Object[]> sourceDefect = maintRepository.countDefectsBySourceRackLocation(year, month);
		// 도착지 Rack의 불량 수를 가져옴
		List<Object[]> destinationDefect = maintRepository.countDefectsByDestinationRackLocation(year, month);

		// 출발지 Rack의 불량 수를 합산
		for (Object[] record : sourceDefect) {
			String rackLocation = (String) record[0];
			Integer defectCount = ((Long) record[1]).intValue();
			defectCounts.put(rackLocation, defectCounts.getOrDefault(rackLocation, 0) + defectCount);
		}

		// 도착지 Rack의 불량 수를 합산
		for (Object[] record : destinationDefect) {
			String rackLocation = (String) record[0];
			Integer defectCount = ((Long) record[1]).intValue();
			defectCounts.put(rackLocation, defectCounts.getOrDefault(rackLocation, 0) + defectCount);
		}

		return defectCounts;
	}

	/* 작업자별 점검 현황 */
	public int userRepairThisMonth(String user_id, String status) {
		List<Maint> maintList = maintRepository.countRepairThisMonthForUser(user_id);

		long count = maintList.stream().filter(m -> status.equals(m.getMaint_status())).count();

		return (int) count;
	}

    // 보수 완료 내역을 사용자 ID로 카운트
	public int countCompletedMaintenanceByUser(String userId) {
		return maintRepository.countCompletedMaintenanceByUserWithDefectiveItems(userId);
	}

}
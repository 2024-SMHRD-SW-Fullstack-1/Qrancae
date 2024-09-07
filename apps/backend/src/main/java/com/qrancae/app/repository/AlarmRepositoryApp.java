package com.qrancae.app.repository;

import com.qrancae.app.model.AlarmData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlarmRepositoryApp extends JpaRepository<AlarmData, Long> {
	
    AlarmData findByMaintIdxAndUserId(Long maintIdx, String userId);
    
    @Query("SELECT a FROM AlarmData a WHERE a.userId = :userId AND EXISTS (SELECT 1 FROM MaintApp m WHERE m.maintIdx = a.maintIdx AND m.maintUserId = :userId AND m.maintStatus = '점검중')")
    List<AlarmData> findAlarmsForUserWithInProgressMaint(String userId);
    
    @Query("SELECT a.alarmMsg FROM AlarmData a WHERE a.maintIdx = :maintIdx")
    String findAlarmMsgByMaintIdx(Integer maintIdx);
    
    @Query("SELECT a.alarmDate FROM AlarmData a WHERE a.maintIdx = :maintIdx")
    LocalDateTime findAlarmDateByMaintIdx(Integer maintIdx);
}

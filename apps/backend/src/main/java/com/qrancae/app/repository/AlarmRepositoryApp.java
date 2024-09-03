package com.qrancae.app.repository;

import com.qrancae.app.model.AlarmData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlarmRepositoryApp extends JpaRepository<AlarmData, Long> {
    AlarmData findByMaintIdxAndUserId(Long maintIdx, String userId);
}

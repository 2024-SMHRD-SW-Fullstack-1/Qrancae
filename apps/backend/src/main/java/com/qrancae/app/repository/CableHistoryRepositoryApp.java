package com.qrancae.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qrancae.app.model.CableHistoryApp;

@Repository
public interface CableHistoryRepositoryApp extends JpaRepository<CableHistoryApp, Integer> {

    // 특정 케이블 인덱스에 대해 connect_date가 없는 가장 최근 기록 조회
    Optional<CableHistoryApp> findFirstByCableIdxAndConnectDateIsNull(Integer cableIdx);

    // 케이블 인덱스에 대해 가장 오래된 연결 기록 조회 (설치일자)
    Optional<CableHistoryApp> findFirstByCableIdxOrderByConnectDateAsc(Integer cableIdx);

    // 케이블 인덱스에 대한 가장 최근 연결 기록 조회 (제거되지 않은 경우)
    Optional<CableHistoryApp> findFirstByCableIdxAndRemoveDateIsNullOrderByConnectDateDesc(Integer cableIdx);
    
    // 케이블 인덱스로 유지보수 내역 조회 
    List<CableHistoryApp> findByCableIdxOrderByConnectDateDesc(Integer cableIdx);
    
    
}

package com.qrancae.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qrancae.app.model.LogApp;

public interface LogRepositoryApp extends JpaRepository<LogApp, Long> {
    boolean existsByCableIdx(Integer cableIdx);
}

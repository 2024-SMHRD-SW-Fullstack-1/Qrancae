package com.qrancae.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.qrancae.model.Qr;

import jakarta.transaction.Transactional;

public interface QrRepository extends JpaRepository<Qr, Integer> {

}

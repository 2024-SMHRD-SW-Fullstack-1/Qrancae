package com.qrancae.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.qrancae.model.Qr;

public interface QrRepository extends JpaRepository<Qr, Integer> {

}

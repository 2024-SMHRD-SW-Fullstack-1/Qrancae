package com.qrancae.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.qrancae.model.Qr;
import com.qrancae.repository.QrRepository;

@Service
public class QrService {
	@Autowired
	private QrRepository qrRepository;

	// 해당 Qr DB에 등록
	public void insertQr(Qr qr) {
		qrRepository.save(qr);
	}
}

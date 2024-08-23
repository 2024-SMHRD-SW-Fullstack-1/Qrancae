package com.qrancae.controller;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.qrancae.model.Cable;
import com.qrancae.service.CableService;


@RestController
@CrossOrigin(origins = "http://localhost:3000") // 프론트 주소
public class QrController {
	@Autowired
	private CableService cableService;
	
	// QR 코드 등록
	@PostMapping("/registerQr")
	public void registerQr(@RequestBody List<Cable> cableList) {
		for(Cable c: cableList) {
			System.out.println(c.getCable_idx());
			System.out.println(c.getS_rack_number());
			System.out.println(c.getInstallation_date());
		}
		int maxIdx = cableService.getCableIdx();
		System.out.println(maxIdx);
	}
}

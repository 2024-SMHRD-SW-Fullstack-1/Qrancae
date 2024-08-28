package com.qrancae.controller;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.qrancae.model.Cable;
import com.qrancae.model.Qr;
import com.qrancae.service.CableService;
import com.qrancae.service.QrService;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // 프론트 주소
public class QrController {
	@Autowired
	private CableService cableService;

	@Autowired
	private QrService qrService;

	// 고정 AES 키
	private static final String FIXED_KEY = "qrancae123456789";

	// FIXED_KEY 가져오기
	public static SecretKey getFixedKey() {
		// 16바이트로 만든 고정 키
		byte[] keyBytes = FIXED_KEY.getBytes(StandardCharsets.UTF_8);
		return new SecretKeySpec(keyBytes, "AES");
	}

	// 데이터를 암호화
	public static String encrypt(String data, SecretKey key) throws Exception {
		Cipher cipher = Cipher.getInstance("AES");
		cipher.init(Cipher.ENCRYPT_MODE, key);
		byte[] encryptedData = cipher.doFinal(data.getBytes());
		return Base64.getEncoder().encodeToString(encryptedData);
	}

	// 데이터를 복호화
	public static String decrypt(String encryptedData, SecretKey key) throws Exception {
		Cipher cipher = Cipher.getInstance("AES");
		cipher.init(Cipher.DECRYPT_MODE, key);
		byte[] decodedData = Base64.getDecoder().decode(encryptedData);
		return new String(cipher.doFinal(decodedData));
	}

	@GetMapping("/cablelist")
	public List<Cable> cablelist() {
		System.out.println("cablelist 가져오기");
		List<Cable> cablelist = cableService.cablelist();
		System.out.println("가져온 cablelist : " + cablelist);
		return cablelist;
	}

	// QR 코드 등록
	@PostMapping("/registerQr")
	public String registerQr(@RequestBody List<Cable> cableList) throws WriterException, JsonProcessingException {
		int width = 118;
		int height = 118;

		for (Cable c : cableList) {
			try {
				cableService.insertCable(c);
				int idx = cableService.getCableIdx();

				String data = idx + "," + c.getS_rack_number() + "," + c.getS_rack_location() + ","
						+ c.getS_server_name() + "," + c.getS_port_number() + "," + c.getD_rack_number() + ","
						+ c.getD_rack_location() + "," + c.getD_server_name() + "," + c.getD_port_number();

				// AES 키
				SecretKey key = getFixedKey();
				String encryptedData = encrypt(data, key);

				BitMatrix encode = new MultiFormatWriter().encode(encryptedData, BarcodeFormat.QR_CODE, width, height);

				// 파일 경로 지정
				Path savePath = Paths.get("src/main/resources/qrImage", "cable" + idx + ".png");
				File directory = savePath.getParent().toFile();
				if (!directory.exists()) {
					directory.mkdirs();
				}

				// QR 코드를 파일로 저장
				try (FileOutputStream out = new FileOutputStream(savePath.toFile())) {
					MatrixToImageWriter.writeToStream(encode, "PNG", out);
				}

				Qr qr = new Qr();
				qr.setCable_idx(idx);
				qr.setQr_data(encryptedData);
				qrService.insertQr(qr);

			} catch (Exception e) {
				e.printStackTrace();
			}

		}

		return "완료";
	}
}

package com.qrancae.controller;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
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
	
	// QR 코드 등록
	@PostMapping("/registerQr")
	public String registerQr(@RequestBody List<Cable> cableList) throws WriterException, JsonProcessingException {

		int idx = cableService.getCableIdx() + 1;
		System.out.println("케이블 목록 최대 idx : " + idx);
		
        // QR 해상도 (크기)
        int width = 118;
        int height = 118;
        
        for(Cable c : cableList) {
        	c.setCable_idx(idx);        	
        	String data = idx+","+c.getS_rack_number()+","+c.getS_rack_location()+","+c.getS_server_name()+","+c.getS_port_number()+","
        					+c.getD_rack_number()+","+c.getD_rack_location()+","+c.getD_server_name()+","+c.getD_port_number();
        	
        	// QR code 정보 생성
            BitMatrix encode;
            try {
            	// AES 키
            	SecretKey key = getFixedKey();
            	
            	// 데이터 암호화
            	String encryptedData = encrypt(data, key);
            	
                encode = new MultiFormatWriter().encode(encryptedData, BarcodeFormat.QR_CODE, width, height);
                
                // 파일 경로 지정
                Path savePath = Paths.get("src/main/resources/qrImage", "qr" + idx + ".png");
                idx++;

                // 폴더가 존재하지 않으면 생성
                File directory = savePath.getParent().toFile();
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                // QR 코드를 파일로 저장
                try (FileOutputStream out = new FileOutputStream(savePath.toFile())) {
                    MatrixToImageWriter.writeToStream(encode, "PNG", out);
                }
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        return "완료";
	}
}

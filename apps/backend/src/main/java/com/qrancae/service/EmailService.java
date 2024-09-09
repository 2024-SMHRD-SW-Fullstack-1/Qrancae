package com.qrancae.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
	
	@Autowired
	private JavaMailSender javaMailSender;
	
	public void sendEmail(String to, String subject, String text) throws MessagingException {
		MimeMessage message = javaMailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
		
		helper.setTo(to); // 수신자 이메일 주소
		helper.setFrom("kyshs45@naver.com"); // 발신자 이메일 주소
		helper.setSubject(subject); // 메일 제목
		helper.setText(text, true); // 메일 내용, HTML 형식 가능
		
		Resource resource = new ClassPathResource("/logo.png");
		helper.addInline("logo", resource);
		
		Resource qr = new ClassPathResource("/adminQr.png");
		helper.addInline("adminQr", qr);
		
		javaMailSender.send(message); // 메일 전송
	}
}

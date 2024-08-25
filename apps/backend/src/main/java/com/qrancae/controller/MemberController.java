package com.qrancae.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class MemberController {
	// 로그인
	@PostMapping("/login")
	public void login(HttpServletRequest request) {
		
	}
}

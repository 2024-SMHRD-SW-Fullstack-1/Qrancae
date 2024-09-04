package com.qrancae;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QrancaeApplication {

	public static void main(String[] args) {
		SpringApplication.run(QrancaeApplication.class, args);
	}

}

package com.qrancae.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrintQr {
	private String img;
	private String source;
	private String destination;
}

package com.qrancae.codec;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.UUID;

import org.apache.commons.io.FileUtils;
import org.apache.tomcat.util.codec.binary.Base64;

public class Base64Codec {
	
	// 파일 -> Base64로 변환 (인코딩)
	public static String makeStringWithFile(String filePath) throws IOException {
		byte[] byteArray = FileUtils.readFileToByteArray(new File(filePath));
		String base64String = Base64.encodeBase64String(byteArray);
		
		return base64String;
	}

}

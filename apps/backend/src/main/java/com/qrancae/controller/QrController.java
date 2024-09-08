package com.qrancae.controller;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
import com.qrancae.codec.Base64Codec;
import com.qrancae.model.Cable;
import com.qrancae.model.History;
import com.qrancae.model.Log;
import com.qrancae.model.PrintQr;
import com.qrancae.model.Qr;
import com.qrancae.model.User;
import com.qrancae.service.CableService;
import com.qrancae.service.HistoryService;
import com.qrancae.service.QrService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin(origins = "http://3.37.10.193")  // 배포된 React 서버 주소
public class QrController {
	@Autowired
	private CableService cableService;

	@Autowired
	private QrService qrService;

	@Autowired
	private HistoryService historyService;
	
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
		int width = 200;
		int height = 200;

		for (Cable c : cableList) {
			try {
				cableService.insertCable(c);
				int idx = cableService.getCableIdx();

				String data = idx + "," + c.getS_rack_number() + "," + c.getS_rack_location() + ","
						+ c.getS_server_name() + "," + c.getS_port_number() + "," + c.getD_rack_number() + ","
						+ c.getD_rack_location() + "," + c.getD_server_name() + "," + c.getD_port_number();

				// AES 키
				SecretKey key = getFixedKey();
				String encryptedData = encrypt(Integer.toString(idx), key);

				BitMatrix encode = new MultiFormatWriter().encode(encryptedData, BarcodeFormat.QR_CODE, width, height);
				//BitMatrix encode = new MultiFormatWriter().encode(Integer.toString(idx), BarcodeFormat.QR_CODE, width, height);
				
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
	
	// QR 코드 프린트
	@PostMapping("/printQr")
	public List<PrintQr> printQr(@RequestBody List<Integer> cableIdxList) throws IOException {
		
		List<PrintQr> qrImgList = new ArrayList<PrintQr>();
		
		for(Integer i : cableIdxList) {
			String img = Base64Codec.makeStringWithFile("src/main/resources/qrImage/cable"+i+".png");		
			Cable cable = cableService.getCableByIdx(i);
			String source = cable.getS_rack_number() + "-"+ cable.getS_rack_location() + "-"+ cable.getS_port_number();
			String destination = cable.getD_rack_number() + "-"+ cable.getD_rack_location() + "-"+ cable.getD_port_number();
			qrImgList.add(new PrintQr(img, source, destination));
		}
		
		return qrImgList;
	}
	
	@PostMapping("/printComplete")
	public void printComplete(@RequestBody List<Integer> cableIdxList) {
		qrService.printCompleteIdx(cableIdxList);
	}
	
	// 선택된 케이블 정보 삭제
	@PostMapping("/deleteQr")
	public String deleteQr(@RequestBody List<Integer> cableIdxList) {
		// 해당 케이블의 케이블과 QR 정보 삭제
		cableService.deleteCables(cableIdxList);
		
		// 해당 케이블의 QR 코드 이미지 파일 삭제
	    for (Integer idx : cableIdxList) {
	        Path imagePath = Paths.get("src/main/resources/qrImage", "cable" + idx + ".png");
	        try {
	            Files.deleteIfExists(imagePath);
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	    }
		
		return "삭제 완료";
	}
	
	@GetMapping("/reportCable")
	public void reportMain(HttpServletResponse response) throws IOException {
		Workbook workbook = new XSSFWorkbook();

		// 날짜 포맷 설정
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 (EEE)", java.util.Locale.KOREAN);
		DateTimeFormatter dateFormatterMonth = DateTimeFormatter.ofPattern("yyyy.MM");

		// 보고서 시트 작성
		Sheet reportSheet = workbook.createSheet("요약");

		// Header 스타일 설정
		Font headerFont = workbook.createFont();
		headerFont.setBold(true);
		headerFont.setFontHeightInPoints((short) 12);

		// Title 스타일 설정
		Font titleFont = workbook.createFont();
		titleFont.setBold(true);
		titleFont.setFontHeightInPoints((short) 18);
		CellStyle titleCellStyle = workbook.createCellStyle();
		titleCellStyle.setFont(titleFont);

		// Header 스타일 설정
		CellStyle headerCellStyle = workbook.createCellStyle();
		headerCellStyle.setFont(headerFont);
		headerCellStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex()); // 옅은 회색 배경
		headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		headerCellStyle.setBorderBottom(BorderStyle.THIN); // 아래쪽 테두리 추가
		headerCellStyle.setBorderLeft(BorderStyle.THIN); // 왼쪽 테두리 추가
		headerCellStyle.setBorderRight(BorderStyle.THIN); // 오른쪽 테두리 추가
		headerCellStyle.setBorderTop(BorderStyle.THIN); // 위쪽 테두리 추가
		headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
		headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

		// 데이터 셀 스타일 설정 (모든 셀에 테두리 추가)
		CellStyle dataCellStyle = workbook.createCellStyle();
		dataCellStyle.setBorderBottom(BorderStyle.THIN);
		dataCellStyle.setBorderLeft(BorderStyle.THIN);
		dataCellStyle.setBorderRight(BorderStyle.THIN);
		dataCellStyle.setBorderTop(BorderStyle.THIN);
		dataCellStyle.setAlignment(HorizontalAlignment.CENTER);
		dataCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

		// 현황 요약
		int rowNum = 0;
		Row summaryTitleRow = reportSheet.createRow(rowNum++);
		String summaryTitle = "로그 요약 보고서";
		Cell summaryTitleCell = summaryTitleRow.createCell(0);
		summaryTitleCell.setCellValue(summaryTitle);
		summaryTitleCell.setCellStyle(titleCellStyle);
		summaryTitleRow.setHeightInPoints(30);

		Row summaryHeaderRow = reportSheet.createRow(rowNum++);
		summaryHeaderRow.setHeightInPoints(22);
		String[] summaryHeaders = { "점검표", "점검 빈도", "대상 시설", "날짜" };
		String[] summaryValues = { "케이블 포설/제거 내역", "매일마다 | 1회", "서버실 전체", LocalDate.now().format(dateFormatter) };

		for (int i = 0; i < summaryHeaders.length; i++) {
			Cell cell = summaryHeaderRow.createCell(i);
			cell.setCellValue(summaryHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		Row summaryDataRow = reportSheet.createRow(rowNum++);
		summaryDataRow.setHeightInPoints(22);
		for (int i = 0; i < summaryValues.length; i++) {
			Cell cell = summaryDataRow.createCell(i);
			cell.setCellValue(summaryValues[i]);
			cell.setCellStyle(dataCellStyle);
		}

		reportSheet.createRow(rowNum++);
		reportSheet.createRow(rowNum++);

		// 연도별 포설 및 제거 현황
		Row cntYearTitleRow = reportSheet.createRow(rowNum++);
		String cntYearTitle = "연도별 포설/제거 현황";
		
		Cell cntYearTitleCell = cntYearTitleRow.createCell(0);
		cntYearTitleCell.setCellValue(cntYearTitle);
		cntYearTitleCell.setCellStyle(titleCellStyle);
		cntYearTitleRow.setHeightInPoints(30);
		
		String[] cntYearHeaders = { "연도", "포설", "제거"};
		Row cntYearRow = reportSheet.createRow(rowNum++);
		cntYearRow.setHeightInPoints(22);
		
		for (int i = 0; i < cntYearHeaders.length; i++) {
			Cell cell =cntYearRow.createCell(i);
			cell.setCellValue(cntYearHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}
		
		
		String year = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy년"));
		String connect = Integer.toString(historyService.cntYearConnectHistory());
		String remove = Integer.toString(historyService.cntYearRemoveHistory());
		String[] cntYearValues = {year, connect, remove};
		
		Row cntYearDataRow = reportSheet.createRow(rowNum++);
		cntYearDataRow.setHeightInPoints(22);
		for (int i=0; i<cntYearValues.length; i++) {
			Cell cell = cntYearDataRow.createCell(i);
			cell.setCellValue(cntYearValues[i]);
			cell.setCellStyle(dataCellStyle);
		}
		
		// 이달의 케이블 포설/제거 시트
		Sheet monthSheet = workbook.createSheet("상세");
		
		int rowMonthNum = 0;
		Row monthTitleRow = monthSheet.createRow(rowMonthNum++);
		String monthTitle = "이번달 포설/제거 내역";
		
		Cell monthTitleCell = monthTitleRow.createCell(0);
		monthTitleCell.setCellValue(monthTitle);
		monthTitleCell.setCellStyle(titleCellStyle);
		monthTitleRow.setHeightInPoints(30);
		
		Cell monthSubtitleCell = monthTitleRow.createCell(1);
		monthSubtitleCell.setCellValue(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy년 M월")));
		
		Row monthHeaderRow = monthSheet.createRow(rowMonthNum++);
		monthHeaderRow.setHeightInPoints(22);
		monthHeaderRow.createCell(0).setCellValue("케이블");
		monthHeaderRow.getCell(0).setCellStyle(headerCellStyle);
		monthHeaderRow.createCell(1).setCellValue("포설");
		monthHeaderRow.createCell(3).setCellValue("제거");
		
		monthSheet.addMergedRegion(new CellRangeAddress(rowMonthNum-1, rowMonthNum-1, 1, 2));
		CellRangeAddress region1 = new CellRangeAddress(rowMonthNum-1, rowMonthNum-1, 1, 2);
	    setCellBorders(monthSheet, region1, headerCellStyle);
		
		monthSheet.addMergedRegion(new CellRangeAddress(rowMonthNum-1, rowMonthNum-1, 3, 4));
		CellRangeAddress region2 = new CellRangeAddress(rowMonthNum-1, rowMonthNum-1, 3, 4);
	    setCellBorders(monthSheet, region2, headerCellStyle);
		
	    List<History> historyList = historyService.historyListThisMonth();
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yy년 MM월 dd일 a h시 mm분 ss초", Locale.KOREAN);
	    for(History history : historyList) {
	    	Row row = monthSheet.createRow(rowMonthNum++);
	    	row.setHeightInPoints(22);
	    	
	    	String cable = Integer.toString(history.getCable_idx());
	    	String connectUser = "-";
	    	String connectDate = "-";
	    	String removeUser = "-";
	    	String removeDate = "-";
	    	if (history.getConnectUser() != null) {
	    		connectUser = history.getConnectUser().getUser_name()+" ("+history.getConnectUser().getUser_id()+")";
	    		connectDate = history.getConnect_date().format(formatter);
	    	}
	    	if (history.getRemoveUser() != null) {
	    		removeUser = history.getRemoveUser().getUser_name()+" ("+history.getRemoveUser().getUser_id()+")";
	    		removeDate = history.getRemove_date().format(formatter);
	    	}
	    	
	    	String[] values = {cable, connectUser, connectDate, removeUser, removeDate};
	    	for (int i=0; i<values.length; i++) {
	    		Cell cell = row.createCell(i);
	    		cell.setCellValue(values[i]);
	    		cell.setCellStyle(dataCellStyle);
	    	}
	    }
		
		// 너비 설정
		int[] sheetIndices = { 0, 1 };
		for (int sheetIndex : sheetIndices) {
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			int numCols = 8;
			for (int i = 0; i < numCols; i++) {
				sheet.setColumnWidth(i, 40 * 256);
			}
		}

		// 엑셀 파일 다운로드 설정
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		workbook.write(outputStream);
		workbook.close();

		byte[] excelContent = outputStream.toByteArray();
		response.setHeader("Content-Disposition", "attachment; filename=\"report.xlsx\"");
		response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
		response.setContentLength(excelContent.length);

		response.getOutputStream().write(excelContent);
	}
	
	// 병합된 셀 스타일
		private void setCellBorders(Sheet sheet, CellRangeAddress region, CellStyle style) {
		    for (int i = region.getFirstRow(); i <= region.getLastRow(); i++) {
		        Row row = sheet.getRow(i);
		        if (row == null) {
		            row = sheet.createRow(i);
		        }
		        for (int j = region.getFirstColumn(); j <= region.getLastColumn(); j++) {
		            Cell cell = row.getCell(j);
		            if (cell == null) {
		                cell = row.createCell(j);
		            }
		            cell.setCellStyle(style);
		        }
		    }
		}
}

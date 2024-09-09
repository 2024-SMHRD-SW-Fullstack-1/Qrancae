package com.qrancae.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Log;
import com.qrancae.model.User;
import com.qrancae.service.LogService;
import com.qrancae.service.MemberService;


import jakarta.servlet.http.HttpServletResponse;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class LogController {
   
	@Autowired
	private LogService logService;

	@Autowired
	private MemberService memberService;

	@GetMapping("/getlog")
	public List<Log> getLog(@RequestParam(required = false) String startDate,@RequestParam(required = false) String endDate) {
		
		// DateTimeFormatter를 사용하여 날짜 포맷을 명시적으로 지정 (UTC 시간대 포함)
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");

	    // null 처리: startDate가 null이면 12달 전, endDate가 null이면 현재 시각으로 설정
	    LocalDateTime start = (startDate != null) ? OffsetDateTime.parse(startDate, formatter).toLocalDateTime() : LocalDateTime.now().minusMonths(12);
	    LocalDateTime end = (endDate != null) ? OffsetDateTime.parse(endDate, formatter).toLocalDateTime() : LocalDateTime.now();

		List<Log> logs = logService.getLogResultWithinDateRange(start, end);
		

		return logs;
	}

	@GetMapping("/reportLog")
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
		String[] summaryValues = { "케이블 로그 내역", "매일마다 | 1회", "서버실 전체", LocalDate.now().format(dateFormatter) };

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

		// 로그 내역 현황
		Row cntLogTitleRow = reportSheet.createRow(rowNum++);
		String cntLogTitle = "로그 내역 현황";

		Cell cntLogTitleCell = cntLogTitleRow.createCell(0);
		cntLogTitleCell.setCellValue(cntLogTitle);
		cntLogTitleCell.setCellStyle(titleCellStyle);
		cntLogTitleRow.setHeightInPoints(30);

		String today = LocalDate.now().format(dateFormatter);
		String week = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).format(dateFormatter)
				+ " ~ " + LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).format(dateFormatter);
		String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy년 M월"));

		String[] cntLogDateHeaders = { today, week, month };
		Row cntLogDateRow = reportSheet.createRow(rowNum++);
		cntLogDateRow.setHeightInPoints(22);

		for (int i = 0; i < cntLogDateHeaders.length; i++) {
			Cell cell = cntLogDateRow.createCell(i);
			cell.setCellValue(cntLogDateHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		int cntLogToday = logService.getCntLogToday();
		int cntLogWeek = logService.getCntLogWeek();
		int cntLogMonth = logService.getCntLogMonth();
		int[] cntLogDateValues = { cntLogToday, cntLogWeek, cntLogMonth };

		Row cntLogDateDataRow = reportSheet.createRow(rowNum++);
		cntLogDateDataRow.setHeightInPoints(22);
		for (int i = 0; i < cntLogDateValues.length; i++) {
			Cell cell = cntLogDateDataRow.createCell(i);
			cell.setCellValue(cntLogDateValues[i]);
			cell.setCellStyle(dataCellStyle);
		}

		reportSheet.createRow(rowNum++);
		reportSheet.createRow(rowNum++);

		// 작업자별 로그 현황
		Row userTitleRow = reportSheet.createRow(rowNum++);
		String userTitle = "작업자별 로그 현황";

		Cell userTitleCell = userTitleRow.createCell(0);
		userTitleCell.setCellValue(userTitle);
		userTitleCell.setCellStyle(titleCellStyle);
		userTitleRow.setHeightInPoints(30);

		Cell userSubtitleCell = userTitleRow.createCell(1);
		userSubtitleCell.setCellValue(LocalDate.now().format(dateFormatter));

		List<User> userList = memberService.getUserTypeU();
		String[] userHeaders = { "작업자명", "로그 횟수" };

		Row userHeaderRow = reportSheet.createRow(rowNum++);
		userHeaderRow.setHeightInPoints(22);

		for (int i = 0; i < userHeaders.length; i++) {
			Cell userHeaderCell = userHeaderRow.createCell(i);
			userHeaderCell.setCellValue(userHeaders[i]);
			userHeaderCell.setCellStyle(headerCellStyle);
		}

		for (User user : userList) {
			Row logDataRow = reportSheet.createRow(rowNum++);
			logDataRow.setHeightInPoints(22);

			Cell workerNameCell = logDataRow.createCell(0);
			workerNameCell.setCellValue(user.getUser_name() + " (" + user.getUser_id() + " )");
			workerNameCell.setCellStyle(dataCellStyle);

			Cell totalLogCell = logDataRow.createCell(1);
			totalLogCell.setCellValue(logService.countLogsForUserThisMonth(user.getUser_id()));
			totalLogCell.setCellStyle(dataCellStyle);
		}

		// 오늘의 로그 시트
		Sheet todayLogSheet = workbook.createSheet("로그 상세");

		int rowTodayNum = 0;
		Row todayLogTitleRow = todayLogSheet.createRow(rowTodayNum++);
		String todayLogTitle = "로그 내역";
		Cell todayLogTitleCell = todayLogTitleRow.createCell(0);
		todayLogTitleCell.setCellValue(todayLogTitle);
		todayLogTitleCell.setCellStyle(titleCellStyle);
		todayLogTitleRow.setHeightInPoints(30);
		
		Cell todayLogSubtitleCell = todayLogTitleRow.createCell(1);
		todayLogSubtitleCell.setCellValue(LocalDate.now().format(dateFormatter));
		
		Row todayLogHeaderRow = todayLogSheet.createRow(rowTodayNum++);
		todayLogHeaderRow.setHeightInPoints(22);
		String[] todayLogHeaders = {"작업자", "케이블", "시간"};
		
		for(int i=0; i<todayLogHeaders.length; i++) {
			Cell cell = todayLogHeaderRow.createCell(i);
			cell.setCellValue(todayLogHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}
		
		List<Log> logList = logService.getLogListToday();
		for(Log log:logList) {
			Row row = todayLogSheet.createRow(rowTodayNum++);
			row.setHeightInPoints(22);
			
			Cell workerNameCell = row.createCell(0);
			workerNameCell.setCellValue(log.getUser().getUser_name() + " (" + log.getUser().getUser_id() + " )");
			workerNameCell.setCellStyle(dataCellStyle);
			
			Cell cableCell = row.createCell(1);
			cableCell.setCellValue(log.getCable().getCable_idx());
			cableCell.setCellStyle(dataCellStyle);
			
			LocalDateTime logDateTime = log.getLog_date();
	        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
	                .appendPattern("a hh:mm:ss")
	                .toFormatter();
	        String time = logDateTime.format(formatter);
			
			Cell dateCell = row.createCell(2);
			System.out.println("로그 데이터"+ log.getLog_date());
			dateCell.setCellValue(time);
			dateCell.setCellStyle(dataCellStyle);
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
	
	@GetMapping("/logs/count/{userId}")
	   public ResponseEntity<Integer> getLogCountByUserId(@PathVariable String userId) {
	       User user = memberService.findUserByUserId(userId); // MemberService에 findUserByUserId 메서드를 추가해야 합니다.
	       if (user != null) {
	           int logCount = logService.countLogsByUser(user);
	           return ResponseEntity.ok(logCount);
	       } else {
	           return ResponseEntity.notFound().build();
	       }
	   }

}
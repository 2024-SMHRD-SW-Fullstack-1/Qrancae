package com.qrancae.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.TemporalAdjusters;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Log;
import com.qrancae.model.Maint;
import com.qrancae.model.User;
import com.qrancae.repository.MaintRepository;
import com.qrancae.service.CableService;
import com.qrancae.service.EmailService;
import com.qrancae.service.MaintService;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MaintController {

	@Autowired
	private MaintService maintService;

	@Autowired
	private CableService cableService;

	@Autowired
	private EmailService emailService;

	// 목록 가져오기
	@GetMapping("/getmaint")
	public List<Maint> getMaint() {
		List<Maint> maints = maintService.getMaint();

		return maints;
	}

	// 작업자 가져오기
	@GetMapping("/maint/getusers")
	public List<User> getUsers() {
		return maintService.getAllUsers();
	}

	// 확인하기 클릭 시 오늘 날짜로 업데이트
	@PostMapping("/updatemaint")
	public ResponseEntity<Void> updateMaint(@RequestParam int maintIdx, @RequestParam String userId) {
		System.out.println("유지보수 번호:" + maintIdx);
		// maintService.updateMaint(maintIdx,userId);

		return ResponseEntity.ok().build();
	}

	// 요청한 작업자와 추가 메세지 전달하기
	@PostMapping("/maint/updateuser")
	public ResponseEntity<String> updateMaintUser(@RequestBody Map<String, Object> request) {

		List<Integer> selectedMaints = (List<Integer>) request.get("maintIdxs");
		String selectedUser = (String) request.get("userId");
		String alarmMsg = (String) request.get("alarmMsg");

		if (selectedMaints == null || selectedMaints.isEmpty()) {
			return ResponseEntity.status(400).body("유효하지 않은 maintIdxs 파라미터");
		}

		if (selectedUser == null || selectedUser.isEmpty()) {
			return ResponseEntity.status(400).body("유효하지 않은 userId 파라미터");
		}
		String to = "kyshs45@naver.com";
		String subject = "Test Email";
		String text = "<h1>메일 내용</h1><p>이것은 테스트 메일입니다.<p>";

		try {
			emailService.sendEmail(to, subject, text);
			System.out.println("Email sent successfully!");
		} catch (MessagingException e) {
			e.printStackTrace();
			System.out.println("Failed to send email.");
		}

		System.out.println("추가 메세지 : " + alarmMsg);
		try {
			maintService.updateMaintUser(selectedMaints, selectedUser, alarmMsg);
			return ResponseEntity.ok("작업자 할당 성공");
		} catch (Exception e) {
			return ResponseEntity.status(500).body("작업자 할당 오류: " + e.getMessage());
		}

	}

	// 알림 내역 가져오기
	@GetMapping("/maint/msg")
	public List<Maint> getMaintMsg() {
		List<Maint> maints = maintService.getMaintMsg();

		return maints;
	}

	// 보고서 다운로드
	@GetMapping("/reportMaint")
	public void reportMain(HttpServletResponse response) throws IOException {
		Workbook workbook = new XSSFWorkbook();

		// 날짜 포맷 설정
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 (EEE)", java.util.Locale.KOREAN);

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
		dataCellStyle.setWrapText(true);

		// 현황 요약
		int rowNum = 0;
		Row summaryTitleRow = reportSheet.createRow(rowNum++);
		String summaryTitle = "유지보수 요약 보고서";
		Cell summaryTitleCell = summaryTitleRow.createCell(0);
		summaryTitleCell.setCellValue(summaryTitle);
		summaryTitleCell.setCellStyle(titleCellStyle);
		summaryTitleRow.setHeightInPoints(30);

		Row summaryHeaderRow = reportSheet.createRow(rowNum++);
		summaryHeaderRow.setHeightInPoints(22);
		String[] summaryHeaders = { "점검표", "점검 빈도", "대상 시설", "날짜" };
		String[] summaryValues = { "케이블 유지보수 내역", "매일마다 | 1회", "서버실 전체", LocalDate.now().format(dateFormatter) };

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

		// 상태별 요청 개수
		Row statusTitleRow = reportSheet.createRow(rowNum++);
		String statusTitle = "상태별 요청 개수";
		Cell statusTitleCell = statusTitleRow.createCell(0);
		statusTitleCell.setCellValue(statusTitle);
		statusTitleCell.setCellStyle(titleCellStyle);
		statusTitleRow.setHeightInPoints(30);

		Cell statusSubtitleCell = statusTitleRow.createCell(1);
		statusSubtitleCell.setCellValue(LocalDate.now().format(dateFormatter));

		Row statusHeaderRow = reportSheet.createRow(rowNum++);
		statusHeaderRow.setHeightInPoints(22);

		String[] statusHeaders = { "신규 접수", "진행 중", "보수 완료" };
		for (int i = 0; i < statusHeaders.length; i++) {
			Cell cell = statusHeaderRow.createCell(i);
			cell.setCellValue(statusHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		Row statusDataRow = reportSheet.createRow(rowNum++);
		statusDataRow.setHeightInPoints(22);

		int cntNewRepair = maintService.cntNewRepair();
		int cntInProgressRepair = maintService.cntInProgressRepair();
		int cntCompleteRepair = maintService.cntCompleteRepair();
		int[] statusValues = { cntNewRepair, cntInProgressRepair, cntCompleteRepair };

		for (int i = 0; i < statusValues.length; i++) {
			Cell cell = statusDataRow.createCell(i);
			cell.setCellValue(statusValues[i]);
			cell.setCellStyle(dataCellStyle);
		}

		// 주간 불량률
		Row weekTitleRow = reportSheet.createRow(rowNum++);
		String weekTitle = "주간 불량 현황";
		Cell weekTitleCell = weekTitleRow.createCell(0);
		weekTitleCell.setCellValue(weekTitle);
		weekTitleCell.setCellStyle(titleCellStyle);
		weekTitleRow.setHeightInPoints(30);

		String week = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).format(dateFormatter)
				+ " ~ " + LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).format(dateFormatter);
		Cell weekSubtitleCell = weekTitleRow.createCell(1);
		weekSubtitleCell.setCellValue(week);

		Row weekHeaderRow = reportSheet.createRow(rowNum++);
		weekHeaderRow.setHeightInPoints(22);

		String[] weekHeaders = { "QR 불량", "케이블 불량", "전원 공급 불량" };
		for (int i = 0; i < weekHeaders.length; i++) {
			Cell cell = weekHeaderRow.createCell(i);
			cell.setCellValue(weekHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		Row weekDataRow = reportSheet.createRow(rowNum++);
		weekDataRow.setHeightInPoints(22);

		int cntQrDefect = maintService.cntQrDefect();
		int cntCableDefect = maintService.cntCableDefect();
		int cntPowerDefect = maintService.cntPowerDefect();

		System.out.println("불량 개수" + cntQrDefect + cntCableDefect + cntPowerDefect);

		String[] weekValues = { cntQrDefect + "개", cntCableDefect + "개", cntPowerDefect + "개" };

		for (int i = 0; i < weekValues.length; i++) {
			Cell cell = weekDataRow.createCell(i);
			cell.setCellValue(weekValues[i]);
			cell.setCellStyle(dataCellStyle);
		}

		// 오늘의 유지보수 시트
		Sheet todayMaintSheet = workbook.createSheet("유지보수 상세");

		int rowTodayNum = 0;
		Row todayMaintTitleRow = todayMaintSheet.createRow(rowTodayNum++);
		String todayMaintTitle = "유지보수 내역";

		Cell todayMaintTitleCell = todayMaintTitleRow.createCell(0);
		todayMaintTitleCell.setCellValue(todayMaintTitle);
		todayMaintTitleCell.setCellStyle(titleCellStyle);
		todayMaintTitleRow.setHeightInPoints(30);

		Cell todayMaintSubtitleCell = todayMaintTitleRow.createCell(1);
		todayMaintSubtitleCell.setCellValue(LocalDate.now().format(dateFormatter));

		Row todayMaintHeaderRow = todayMaintSheet.createRow(rowTodayNum++);
		todayMaintHeaderRow.setHeightInPoints(22);
		String[] todayMaintHeaders = { "작업자", "케이블", "QR 상태", "케이블 상태", "전원 공급 상태", "상태" };

		for (int i = 0; i < todayMaintHeaders.length; i++) {
			Cell cell = todayMaintHeaderRow.createCell(i);
			cell.setCellValue(todayMaintHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		List<Maint> maintList = maintService.todayMaintList();

		for (Maint maint : maintList) {
			Row todayDataRow = todayMaintSheet.createRow(rowTodayNum++);
			todayDataRow.setHeightInPoints(22);

			String user = maint.getUser().getUser_name() + " (" + maint.getUser().getUser_id() + ")";
			String cable = Integer.toString(maint.getCable().getCable_idx());
			String statusQr = maint.getMaint_qr();
			String statusCable = maint.getMaint_cable();
			String statusPower = maint.getMaint_power();
			String status = maint.getMaint_status();
			if (maint.getMaint_update() != null) {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yy년 MM월 dd일 a h시 mm분 ss초", Locale.KOREAN);
				status += " (" + maint.getMaintUser().getUser_name() + ")";
				status += "\n" + maint.getMaint_update().format(formatter);
				todayDataRow.setHeightInPoints(38);
			}

			String[] todayMaintValues = { user, cable, statusQr, statusCable, statusPower, status };

			for (int i = 0; i < todayMaintValues.length; i++) {
				Cell cell = todayDataRow.createCell(i);
				cell.setCellValue(todayMaintValues[i]);
				cell.setCellStyle(dataCellStyle);
			}
		}

		int[] sheetIndices = { 0, 1 };
		for (int sheetIndex : sheetIndices) {
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			int numCols = 8;
			for (int i = 0; i < numCols; i++) {
				sheet.setColumnWidth(i, 35 * 256);
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

	// 특정 사용자(user_id)의 보수 완료 내역 수를 반환하는 API
	@GetMapping("/api/maint/count/{userId}")
	public ResponseEntity<Integer> getCompletedMaintenanceCountByUser(@PathVariable String userId) {
		int completedCount = maintService.countCompletedMaintenanceByUser(userId);
		return ResponseEntity.ok(completedCount);
	}

}
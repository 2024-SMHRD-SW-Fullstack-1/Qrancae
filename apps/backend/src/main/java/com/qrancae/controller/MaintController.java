package com.qrancae.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
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

import com.qrancae.model.Maint;
import com.qrancae.model.User;
import com.qrancae.service.MaintService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MaintController {

	@Autowired
	private MaintService maintService;

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

		System.out.println("추가 메세지 : " + alarmMsg);
		try {
			maintService.updateMaintUser(selectedMaints, selectedUser, alarmMsg);
			return ResponseEntity.ok("작업자 할당 성공");
		} catch (Exception e) {
			return ResponseEntity.status(500).body("작업자 할당 오류: " + e.getMessage());
		}
	}
	
	// 보고서 다운로드
	@GetMapping("/reportMaint")
	public void reportMain(HttpServletResponse response) throws IOException {
		Workbook workbook = new XSSFWorkbook();

		// 날짜 포맷 설정
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy.MM.dd(EEE)");

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

		// 시트의 모든 열 너비를 174로 설정
		int[] sheetIndices = { 0 };
		for (int sheetIndex : sheetIndices) {
			Sheet sheet = workbook.getSheetAt(sheetIndex);
			int numCols = 8;
			for (int i = 0; i < numCols; i++) {
				sheet.setColumnWidth(i, 40 * 256); // 너비를 174로 설정
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
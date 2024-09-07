package com.qrancae.controller;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.qrancae.model.Cable;
import com.qrancae.model.Calendar;
import com.qrancae.model.Log;
import com.qrancae.model.Maint;
import com.qrancae.model.User;
import com.qrancae.service.CableService;
import com.qrancae.service.CalendarService;
import com.qrancae.service.LogService;
import com.qrancae.service.MaintService;
import com.qrancae.service.MemberService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class MainController {

	@Autowired
	private CableService cableService;

	@Autowired
	private CalendarService calendarService;

	@Autowired
	private MaintService maintService;

	@Autowired
	private LogService logService;
	
	@Autowired
	private MemberService memberService;

	@PostMapping("/calendar")
	public List<Calendar> calendar() {
		List<Calendar> calendarList = calendarService.getCalendarList();

		return calendarList;
	}

	/* 캘린더 */
	@PostMapping("/addCalendar")
	public String addCalendar(@RequestBody Calendar calendar) {
		System.out.println("추가할 캘린더 시간" + calendar.getCalendar_start());
		calendarService.saveCalendar(calendar);
		return "캘린더 추가 완료";
	}

	@GetMapping("/findCalendar/{calendar_idx}")
	public Calendar findCalendar(@PathVariable Integer calendar_idx) {
		System.out.println("찾고싶은 calnedar_idx : " + calendar_idx);
		Calendar calendar = calendarService.findCalendar(calendar_idx);

		return calendar;
	}

	@PostMapping("/updateCalendar")
	public void updateCalendar(@RequestBody Calendar calendar) {
		calendarService.updateCalendar(calendar);
	}

	@GetMapping("/deleteCalendar/{calendar_idx}")
	public String deleteCalendar(@PathVariable Integer calendar_idx) {
		System.out.println("삭제할 calendar_idx : " + calendar_idx);
		calendarService.deleteCalendar(calendar_idx);

		return "캘린더 삭제 완료";
	}

	// 오늘의 점검
	@GetMapping("/todayRepair")
	public Map<String, Integer> todayRepair() {
		int cntNewRepair = maintService.cntNewRepair(); // 신규 접수
		int cntInProgressRepair = maintService.cntInProgressRepair(); // 진행 중
		int cntCompleteRepair = maintService.cntCompleteRepair(); // 보수 완료

		Map<String, Integer> cnts = new HashMap<String, Integer>();
		cnts.put("cntNewRepair", cntNewRepair);
		cnts.put("cntInProgressRepair", cntInProgressRepair);
		cnts.put("cntCompleteRepair", cntCompleteRepair);

		return cnts;
	}

	// 라인 차트 - 해당 연도의 로그 내역
	@GetMapping("/logChart/{year}")
	public Map<String, Integer> logChart(@PathVariable Integer year) {
		System.out.println(year + "년 로그 내역");
		Map<String, Integer> monthCnt = logService.getMonthLogCnt(year);

		return monthCnt;
	}

	// 파이 차트 - 케이블 불량률
	@GetMapping("/defectChart")
	public List<Map.Entry<String, Double>> defectChart(@RequestParam(required = false) Integer year,
	        @RequestParam(required = false) Integer month, @RequestParam(required = false) String range) {
	    System.out.println("최고 혹은 최저 : " + range);

	    // 랙 번호 당 케이블의 전체 개수
	    Map<String, Integer> cableByRackCounts = cableService.countCablesByRackNumber();
	    // 랙 번호 당 불량 수 (동일 케이블 하나로 카운트)
	    Map<String, Integer> defectCounts = maintService.cntDefectRack(year, month);

	    // 불량률 계산
	    Map<String, Double> defectRates = new HashMap<>();
	    for (String rackNumber : defectCounts.keySet()) {
	        Integer defectCount = defectCounts.get(rackNumber);
	        System.out.println("불량 개수 : " + defectCount);
	        Integer totalCableCount = cableByRackCounts.get(rackNumber);
	        System.out.println("랙의 전체 케이블 개수 : " + totalCableCount);

	        if (totalCableCount != null && totalCableCount > 0) {
	            double defectRate = (double) defectCount / totalCableCount;
	            defectRates.put(rackNumber, defectRate);
	        }
	    }

	    // 불량률을 기준으로 정렬
	    List<Map.Entry<String, Double>> sortedDefectRates = defectRates.entrySet().stream()
	            .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue())) // 내림차순
	            .collect(Collectors.toList());

	    // range에 따라 상위 4개 또는 하위 4개 선택
	    List<Map.Entry<String, Double>> topOrBottomDefects;
	    if ("max".equalsIgnoreCase(range)) {
	        topOrBottomDefects = sortedDefectRates.stream().limit(4).collect(Collectors.toList());
	    } else if ("min".equalsIgnoreCase(range)) {
	        topOrBottomDefects = sortedDefectRates.stream().sorted(Map.Entry.comparingByValue()) // 오름차순
	                .limit(4).collect(Collectors.toList());
	    } else {
	        topOrBottomDefects = Collections.emptyList();
	    }

	    return topOrBottomDefects;
	}

	// 보고서 다운로드
	@GetMapping("/reportMain")
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

		// 현황 요약
		int rowNum = 0;
		Row summaryTitleRow = reportSheet.createRow(rowNum++);
		String summaryTitle = "현황 요약";
		Cell summaryTitleCell = summaryTitleRow.createCell(0);
		summaryTitleCell.setCellValue(summaryTitle);
		summaryTitleCell.setCellStyle(titleCellStyle);
		summaryTitleRow.setHeightInPoints(30);

		Row summaryHeaderRow = reportSheet.createRow(rowNum++);
		summaryHeaderRow.setHeightInPoints(22);
		String[] summaryHeaders = { "점검표", "점검 빈도", "대상 시설", "날짜" };
		String[] summaryValues = { "케이블 점검", "매일마다 | 1회", "서버실 전체", LocalDate.now().format(dateFormatter) };

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

		// 점검 현황 (오늘)
		Row statusTitleRow = reportSheet.createRow(rowNum++);
		String statusTitle = "케이블 점검 현황 ";
		Cell statusTitleCell = statusTitleRow.createCell(0);
		statusTitleCell.setCellValue(statusTitle);
		statusTitleCell.setCellStyle(titleCellStyle);
		statusTitleRow.setHeightInPoints(30);
		
		String statusSubtitle = LocalDate.now().format(dateFormatter);
		Cell statusSubtitleCell = statusTitleRow.createCell(1);
		statusSubtitleCell.setCellValue(statusSubtitle);

		String[] statusHeaders = { "신규 점검", "진행 중인 점검", "완료된 점검", "총 점검" };
		Row statusHeaderMergeRow = reportSheet.createRow(rowNum++);
		statusHeaderMergeRow.setHeightInPoints(22);

		Cell statusMergeCell1 = statusHeaderMergeRow.createCell(0);
		statusMergeCell1.setCellValue("점검 현황");
		statusMergeCell1.setCellStyle(headerCellStyle);
		reportSheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3)); // 0 - 3 컬럼 병합
		CellRangeAddress statusMergedRegion1 = new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3);
		setCellBorders(reportSheet, statusMergedRegion1, headerCellStyle);

		Row statusHeaderRow = reportSheet.createRow(rowNum++);
		statusHeaderRow.setHeightInPoints(22);

		for (int i = 0; i < statusHeaders.length; i++) {
			Cell cell = statusHeaderRow.createCell(i);
			cell.setCellValue(statusHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		Cell statusMergeCell2 = statusHeaderMergeRow.createCell(4);
		statusMergeCell2.setCellValue("점검을 수행한 작업자");
		statusMergeCell2.setCellStyle(headerCellStyle);
		reportSheet.addMergedRegion(new CellRangeAddress(rowNum - 2, rowNum - 1, 4, 4)); // rowNum부터 rowNum + 1까지의 행을 4번 열로 병합
		CellRangeAddress statusMergedRegion2 = new CellRangeAddress(rowNum - 2, rowNum - 1, 4, 4);
		setCellBorders(reportSheet, statusMergedRegion2, headerCellStyle);
		
		int newRepairCnt = maintService.cntNewRepair(); // 신규 점검
		int inProgressRepairCnt = maintService.cntInProgressRepair(); // 진행 중인 점검
		int completeRepairCnt = maintService.cntCompleteRepair(); // 완료된 점검
		int sumRepairCnt = newRepairCnt + inProgressRepairCnt + completeRepairCnt; // 총 점검
		int completeUserCnt = maintService.cntCompleteUser(); // 점검을 수행한 작업자
		int[] statusData = {newRepairCnt, inProgressRepairCnt, completeRepairCnt, sumRepairCnt, completeUserCnt};
		
		Row statusDataRow = reportSheet.createRow(rowNum++);
		statusDataRow.setHeightInPoints(22);
		
		for (int i = 0; i < statusData.length; i++) {
			Cell cell = statusDataRow.createCell(i);
			cell.setCellValue(statusData[i]);
			cell.setCellStyle(dataCellStyle);
		}
		
		reportSheet.createRow(rowNum++);
		reportSheet.createRow(rowNum++);
		
		// 점검 예정이 없는 케이블
		Row noInspectionTitleRow = reportSheet.createRow(rowNum++);
		String noInspectionTitle = "점검 예정이 없는 케이블";
		Cell noInspectionTitleCell = noInspectionTitleRow.createCell(0);
		noInspectionTitleCell.setCellValue(noInspectionTitle);
		noInspectionTitleCell.setCellStyle(titleCellStyle);
		noInspectionTitleRow.setHeightInPoints(30);
		
		LocalDate today = LocalDate.now();
		DateTimeFormatter yearMonthFormatter = DateTimeFormatter.ofPattern("yyyy년 M월");
		String formattedYearMonth = today.format(yearMonthFormatter);
		Cell noInspectionSubtitleCell = noInspectionTitleRow.createCell(1);
		noInspectionSubtitleCell.setCellValue(formattedYearMonth);
		
		String[] noInspectionHeaders = {"점검 예정이 없는 케이블", "점검된 케이블", "점검 완료 비율"};
		
		Row noInspectionHeaderMergeRow = reportSheet.createRow(rowNum++);
		noInspectionHeaderMergeRow.setHeightInPoints(22);

		Cell noInspectionMergeCell1 = noInspectionHeaderMergeRow.createCell(0);
		noInspectionMergeCell1.setCellValue("케이블 현황");
		noInspectionMergeCell1.setCellStyle(headerCellStyle);
		reportSheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 2)); // 0 - 2 컬럼 병합
		CellRangeAddress noInspectionMergedRegion1 = new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 2);
		setCellBorders(reportSheet, noInspectionMergedRegion1, headerCellStyle);

		Row noInspectionHeaderRow = reportSheet.createRow(rowNum++);
		noInspectionHeaderRow.setHeightInPoints(22);

		for (int i = 0; i < noInspectionHeaders.length; i++) {
			Cell cell = noInspectionHeaderRow.createCell(i);
			cell.setCellValue(noInspectionHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		Cell noInspectionMergeCell2 = noInspectionHeaderMergeRow.createCell(3);
		noInspectionMergeCell2.setCellValue("점검을 수행한 작업자");
		noInspectionMergeCell2.setCellStyle(headerCellStyle);
		reportSheet.addMergedRegion(new CellRangeAddress(rowNum - 2, rowNum - 1, 3, 3)); // rowNum부터 rowNum + 1까지의 행을 3번 열로 병합
		CellRangeAddress noInspectionMergedRegion2 = new CellRangeAddress(rowNum - 2, rowNum - 1, 3, 3);
		setCellBorders(reportSheet, noInspectionMergedRegion2, headerCellStyle);
		
		int allCableCnt = cableService.count(); // 전체 케이블의 수
		int allInspectCableCnt = maintService.countMaintThisMonth(); // 이번달 전체 유지보수 수
		int inspectCableCnt = maintService.countCablesCompletedThisMonth(); // 이번달 점검된 케이블
		double completionRate = (allCableCnt > 0) ? (double) inspectCableCnt / allInspectCableCnt * 100 : 0; // 점검 완료 비율 계산
		String formattedCompletionRate = String.format("%.1f%%", completionRate); // 소수점 한 자리까지 포맷팅
		int insepctCompleteUserCnt = maintService.countDistinctMaintUserIdsForCompletedMaintenanceThisMonth(); // 이달의 점검을 수행한 작업자
		
		Object[] noInspectionData = {allCableCnt-inspectCableCnt, inspectCableCnt, formattedCompletionRate, insepctCompleteUserCnt};
		
		Row noInspectionDataRow = reportSheet.createRow(rowNum++);
		noInspectionDataRow.setHeightInPoints(22);
		
		for (int i = 0; i < noInspectionData.length; i++) {
			Cell cell = noInspectionDataRow.createCell(i);
			if (noInspectionData[i] instanceof Integer) {
		        cell.setCellValue((Integer) noInspectionData[i]);
		    } else if (noInspectionData[i] instanceof Double) {
		        cell.setCellValue((Double) noInspectionData[i]);
		    } else if (noInspectionData[i] instanceof String) {
		        cell.setCellValue((String) noInspectionData[i]);
		    }
			cell.setCellStyle(dataCellStyle);
		}
		
		reportSheet.createRow(rowNum++);
		reportSheet.createRow(rowNum++);

		// 사용자별 점검 현황 시트 작성
		Sheet userDetailSheet = workbook.createSheet("작업자 상세");
		
		int rowUserNum = 0;
		Row summaryUserTitleRow = userDetailSheet.createRow(rowUserNum++);
		String summaryUserTitle = "작업자 상세";
		Cell summaryUserTitleCell = summaryUserTitleRow.createCell(0);
		summaryUserTitleCell.setCellValue(summaryUserTitle);
		summaryUserTitleCell.setCellStyle(titleCellStyle);
		summaryUserTitleRow.setHeightInPoints(30);

		Row summaryUserHeaderRow = userDetailSheet.createRow(rowUserNum++);
		summaryUserHeaderRow.setHeightInPoints(22);
		String[] summaryUserHeaders = { "점검표", "점검 빈도", "대상 시설", "날짜" };
		String[] summaryUserValues = { "케이블 점검", "매일마다 | 1회", "서버실 전체", LocalDate.now().format(dateFormatter) };

		for (int i = 0; i < summaryUserHeaders.length; i++) {
			Cell cell = summaryUserHeaderRow.createCell(i);
			cell.setCellValue(summaryUserHeaders[i]);
			cell.setCellStyle(headerCellStyle);
		}

		Row summaryUserDataRow = userDetailSheet.createRow(rowUserNum++);
		summaryUserDataRow.setHeightInPoints(22);
		for (int i = 0; i < summaryUserValues.length; i++) {
			Cell cell = summaryUserDataRow.createCell(i);
			cell.setCellValue(summaryUserValues[i]);
			cell.setCellStyle(dataCellStyle);
		}

		userDetailSheet.createRow(rowUserNum++);
		userDetailSheet.createRow(rowUserNum++);

		// 작업자별 점검 현황
		Row userTitleRow = userDetailSheet.createRow(rowUserNum++);
		String userTitle = "작업자별 점검 현황";
		Cell userTitleCell = userTitleRow.createCell(0);
		userTitleCell.setCellValue(userTitle);
		userTitleCell.setCellStyle(titleCellStyle);
		userTitleRow.setHeightInPoints(30);
		
		Cell userSubtitleCell = userTitleRow.createCell(1);
		userSubtitleCell.setCellValue(formattedYearMonth);
		
		List<User> userList = memberService.getUserTypeU();
		for(User user: userList) {
			String[] userHeaders = { "작업자명", "총 점검", "상세", "점검 완료"};
			Row userHeaderRow = userDetailSheet.createRow(rowUserNum++);
			userHeaderRow.setHeightInPoints(22);
			
			for (int i=0; i<userHeaders.length; i++) {
				Cell userHeaderCell = userHeaderRow.createCell(i);
				userHeaderCell.setCellValue(userHeaders[i]);
				userHeaderCell.setCellStyle(headerCellStyle);
			}
			
			int userNewRepair = maintService.userRepairThisMonth(user.getUser_id(), "신규접수");
			int userInProgressRepair = maintService.userRepairThisMonth(user.getUser_id(), "진행중");
			int userCompleteRepair = maintService.userRepairThisMonth(user.getUser_id(), "보수완료");
			int sum = userNewRepair + userInProgressRepair + userCompleteRepair;
			
			// 첫 번째 데이터 행
			Row firstDataRow = userDetailSheet.createRow(rowUserNum++);
			firstDataRow.setHeightInPoints(22);
			
			Cell workerNameCell = firstDataRow.createCell(0); // 관리자명
			workerNameCell.setCellValue(user.getUser_name()+" ("+user.getUser_id()+")");
			workerNameCell.setCellStyle(dataCellStyle);
			
			Cell totalInspectCell = firstDataRow.createCell(1);
			totalInspectCell.setCellValue(sum);
			totalInspectCell.setCellStyle(dataCellStyle);
			
			Cell detailNewCell = firstDataRow.createCell(2);
			detailNewCell.setCellValue("신규 접수");
			detailNewCell.setCellStyle(dataCellStyle);
			
			Cell cntNewCell = firstDataRow.createCell(3);
			cntNewCell.setCellValue(userNewRepair);
			cntNewCell.setCellStyle(dataCellStyle);
			
			// 두 번째 데이터 행
			Row secondDataRow = userDetailSheet.createRow(rowUserNum++);
		    secondDataRow.setHeightInPoints(22);
		    
		    Cell detailInProgressCell = secondDataRow.createCell(2);
		    detailInProgressCell.setCellValue("진행 중");
		    detailInProgressCell.setCellStyle(dataCellStyle);
		    
		    Cell cntInProgressCell = secondDataRow.createCell(3);
		    cntInProgressCell.setCellValue(userInProgressRepair);
		    cntInProgressCell.setCellStyle(dataCellStyle);
		    
		    // 세 번째 데이터 행
		    Row thirdDataRow = userDetailSheet.createRow(rowUserNum++);
		    thirdDataRow.setHeightInPoints(22);

		    Cell detailCompleteCell = thirdDataRow.createCell(2);
		    detailCompleteCell.setCellValue("보수 완료");
		    detailCompleteCell.setCellStyle(dataCellStyle);

		    Cell cntCompleteCell = thirdDataRow.createCell(3);
		    cntCompleteCell.setCellValue(userCompleteRepair);
		    cntCompleteCell.setCellStyle(dataCellStyle);
		    
		    // 셀 병합
		    userDetailSheet.addMergedRegion(new CellRangeAddress(rowUserNum - 3, rowUserNum - 1, 0, 0));
		    CellRangeAddress region1 = new CellRangeAddress(rowUserNum - 3, rowUserNum - 1, 0, 0);
		    setCellBorders(userDetailSheet, region1, headerCellStyle);
		    
		    userDetailSheet.addMergedRegion(new CellRangeAddress(rowUserNum - 3, rowUserNum - 1, 1, 1));
		    CellRangeAddress region2 = new CellRangeAddress(rowUserNum - 3, rowUserNum - 1, 1, 1);
		    setCellBorders(userDetailSheet, region2, headerCellStyle);
		    
		    userDetailSheet.createRow(rowUserNum++);
			userDetailSheet.createRow(rowUserNum++);
		}
		
		// 점검 상세 시트 <- 나중에 추가 고려

		// 시트의 모든 열 너비를 174로 설정
		int[] sheetIndices = { 0, 1 }; // 0 - 요약 시트, 1 - 케이블별 점검 현황 시트
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

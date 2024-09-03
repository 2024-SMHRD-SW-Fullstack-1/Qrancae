package com.qrancae.app.model;

import lombok.Data;

@Data
public class MaintenanceTask {

    private String maintCable;
    private String maintQr;
    private String maintPower;
    private String status;
    private String maintDate;  // LocalDateTime에서 String으로 변경
    private String alarmDate;  // LocalDateTime에서 String으로 변경
    private String alarmMsg;
    private String sRackNumber;
    private String sRackLocation;
    private String cableIdx;
}

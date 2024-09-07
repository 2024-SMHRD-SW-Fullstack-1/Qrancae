package com.qrancae.app.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CableHistoryResponse {

    private String connectUserName;
    private String removeUserName;
    private LocalDateTime connectDate;
    private LocalDateTime removeDate;

    public CableHistoryResponse(String connectUserName, String removeUserName, LocalDateTime connectDate, LocalDateTime removeDate) {
        this.connectUserName = connectUserName;
        this.removeUserName = removeUserName;
        this.connectDate = connectDate;
        this.removeDate = removeDate;
    }

}

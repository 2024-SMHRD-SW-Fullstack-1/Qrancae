package com.qrancae.app.model;

import lombok.Data;

@Data
public class MaintStatusResponse {
	
	
	private long newEntryCount;
    private long inProgressCount;
    private long completedCount;

    public MaintStatusResponse(long newEntryCount, long inProgressCount, long completedCount) {
        this.newEntryCount = newEntryCount;
        this.inProgressCount = inProgressCount;
        this.completedCount = completedCount;
    }
}

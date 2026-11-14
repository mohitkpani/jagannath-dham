package com.jagannathdham.dto;

import java.util.List;

public record StaffDashboardResponse(
        long totalScans,
        long successfulScans,
        long rejectedScans,
        List<QrScanResponse> recentScans
) {
}
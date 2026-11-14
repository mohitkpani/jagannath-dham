
package com.jagannathdham.dto;

import java.time.LocalDateTime;

public record RecentScanResponse(
        Long id,
        String staffName,
        String gateCode,
        String scanResult,
        String message,
        LocalDateTime scannedAt
) {}

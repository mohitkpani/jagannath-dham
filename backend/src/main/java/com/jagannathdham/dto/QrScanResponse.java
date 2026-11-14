
package com.jagannathdham.dto;

import java.time.LocalDateTime;

public record QrScanResponse(

        boolean successful,

        String scanResult,

        String message,

        String bookingReference,

        String category,

        String darshanDate,

        Integer visitorCount,

        String gateCode,

        LocalDateTime scannedAt

) {
}

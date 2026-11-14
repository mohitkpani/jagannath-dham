
package com.jagannathdham.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.jagannathdham.enums.BookingStatus;

public record RecentBookingResponse(
        Long id,
        String bookingReference,
        String customerName,
        Integer visitorCount,
        BigDecimal amount,
        BookingStatus bookingStatus,
        LocalDateTime bookedAt
) {}

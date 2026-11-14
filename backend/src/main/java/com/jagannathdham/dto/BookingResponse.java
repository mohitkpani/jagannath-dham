package com.jagannathdham.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(

    Long id,
    String bookingReference,

    Long userId,
    String userName,

    Long darshanSlotId,
    String categoryType,
    LocalDate darshanDate,

    Integer visitorCount,
    BigDecimal amount,

    String bookingStatus,
    String paymentStatus,

    Boolean ticketUsed,

    LocalDateTime bookedAt

) {}
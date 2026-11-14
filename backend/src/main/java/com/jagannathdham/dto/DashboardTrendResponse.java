
package com.jagannathdham.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardTrendResponse(
        LocalDate date,
        long bookings,
        BigDecimal revenue
) {}

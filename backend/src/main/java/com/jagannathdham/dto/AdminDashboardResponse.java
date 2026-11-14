
package com.jagannathdham.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardResponse(
        long totalUsers,
        long totalStaff,
        long totalBookings,
        long confirmedBookings,
        long cancelledBookings,
        BigDecimal totalRevenue,
        long successfulScans,
        long rejectedScans,

        List<DashboardTrendResponse> trends,
        List<RecentBookingResponse> recentBookings,
        List<RecentScanResponse> recentScans
) {}

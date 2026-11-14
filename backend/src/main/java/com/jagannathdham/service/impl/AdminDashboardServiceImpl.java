
package com.jagannathdham.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jagannathdham.dto.AdminDashboardResponse;
import com.jagannathdham.dto.DashboardTrendResponse;
import com.jagannathdham.dto.RecentBookingResponse;
import com.jagannathdham.dto.RecentScanResponse;
import com.jagannathdham.entity.PaymentOrder;
import com.jagannathdham.enums.BookingStatus;
import com.jagannathdham.enums.PaymentStatus;
import com.jagannathdham.repository.BookingRepository;
import com.jagannathdham.repository.PaymentOrderRepository;
import com.jagannathdham.repository.QrScanLogRepository;
import com.jagannathdham.repository.UserRepository;
import com.jagannathdham.service.AdminDashboardService;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentOrderRepository paymentOrderRepository;
    private final QrScanLogRepository qrScanLogRepository;

    public AdminDashboardServiceImpl(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            PaymentOrderRepository paymentOrderRepository,
            QrScanLogRepository qrScanLogRepository) {

        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.paymentOrderRepository = paymentOrderRepository;
        this.qrScanLogRepository = qrScanLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {

        // Existing dashboard statistics
        BigDecimal revenue =
                paymentOrderRepository.getTotalRevenueByPaymentStatus(
                        PaymentStatus.SUCCESS);

        long totalScans = qrScanLogRepository.count();
        long successfulScans =
                qrScanLogRepository.countByScanResult("SUCCESS");

        // Last 7 days, including today
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = today.plusDays(1).atStartOfDay();

        // Booking and revenue trends
        Map<LocalDate, BigDecimal> dailyRevenue = new HashMap<>();

        List<PaymentOrder> successfulPayments =
                paymentOrderRepository.findByPaymentStatusAndCreatedAtBetween(
                        PaymentStatus.SUCCESS,
                        startDateTime,
                        endDateTime);

        for (PaymentOrder payment : successfulPayments) {
            LocalDate date = payment.getCreatedAt().toLocalDate();

            dailyRevenue.merge(
                    date,
                    payment.getAmount(),
                    BigDecimal::add
            );
        }

        List<DashboardTrendResponse> trends = new ArrayList<>();

        for (LocalDate date = startDate;
                !date.isAfter(today);
                date = date.plusDays(1)) {

            long bookings = bookingRepository.countByBookedAtBetween(
                    date.atStartOfDay(),
                    date.plusDays(1).atStartOfDay().minusNanos(1)
            );

            BigDecimal dailyAmount = dailyRevenue.getOrDefault(
                    date,
                    BigDecimal.ZERO
            );

            trends.add(new DashboardTrendResponse(
                    date,
                    bookings,
                    dailyAmount
            ));
        }

        // Recent bookings
        List<RecentBookingResponse> recentBookings =
                bookingRepository.findTop10ByOrderByBookedAtDesc()
                        .stream()
                        .map(booking -> new RecentBookingResponse(
                                booking.getId(),
                                booking.getBookingReference(),
                                booking.getUser().getFullName(),
                                booking.getVisitorCount(),
                                booking.getAmount(),
                                booking.getBookingStatus(),
                                booking.getBookedAt()
                        ))
                        .toList();

        // Recent gate scans
        List<RecentScanResponse> recentScans =
                qrScanLogRepository.findTop10ByOrderByScannedAtDesc()
                        .stream()
                        .map(scan -> new RecentScanResponse(
                                scan.getId(),
                                scan.getScannedBy().getFullName(),
                                scan.getGateCode(),
                                scan.getScanResult(),
                                scan.getMessage(),
                                scan.getScannedAt()
                        ))
                        .toList();

        return new AdminDashboardResponse(
                userRepository.countByRole("USER"),
                userRepository.countByRole("STAFF"),
                bookingRepository.count(),
                bookingRepository.countByBookingStatus(
                        BookingStatus.CONFIRMED),
                bookingRepository.countByBookingStatus(
                        BookingStatus.CANCELLED),
                revenue,
                successfulScans,
                totalScans - successfulScans,
                trends,
                recentBookings,
                recentScans
        );
    }
}

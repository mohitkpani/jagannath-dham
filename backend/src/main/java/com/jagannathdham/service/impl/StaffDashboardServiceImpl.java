
package com.jagannathdham.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jagannathdham.dto.QrScanResponse;
import com.jagannathdham.dto.StaffDashboardResponse;
import com.jagannathdham.entity.Booking;
import com.jagannathdham.entity.QrScanLog;
import com.jagannathdham.entity.QrTicket;
import com.jagannathdham.entity.User;
import com.jagannathdham.repository.QrScanLogRepository;
import com.jagannathdham.repository.UserRepository;
import com.jagannathdham.service.StaffDashboardService;

@Service
@Transactional(readOnly = true)
public class StaffDashboardServiceImpl implements StaffDashboardService {

    private final QrScanLogRepository qrScanLogRepository;
    private final UserRepository userRepository;

    public StaffDashboardServiceImpl(
            QrScanLogRepository qrScanLogRepository,
            UserRepository userRepository) {

        this.qrScanLogRepository = qrScanLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StaffDashboardResponse getStaffDashboard(String staffEmail) {

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Staff not found"));

        if (!"STAFF".equals(staff.getRole())
                || !Boolean.TRUE.equals(staff.getActive())) {
            throw new IllegalArgumentException(
                    "Only active staff members can access this dashboard");
        }

        Long staffId = staff.getId();

        long totalScans =
                qrScanLogRepository.countByScannedById(staffId);

        long successfulScans =
                qrScanLogRepository.countByScannedByIdAndScanResult(
                        staffId, "SUCCESS");

        long rejectedScans = totalScans - successfulScans;

        var recentScans = qrScanLogRepository
                .findTop10ByScannedByIdOrderByScannedAtDesc(staffId)
                .stream()
                .map(this::convertToResponse)
                .toList();

        return new StaffDashboardResponse(
                totalScans,
                successfulScans,
                rejectedScans,
                recentScans
        );
    }

    private QrScanResponse convertToResponse(QrScanLog log) {

        QrTicket ticket = log.getQrTicket();

        if (ticket == null) {
            return new QrScanResponse(
                    false,
                    log.getScanResult(),
                    log.getMessage(),
                    null,
                    null,
                    null,
                    null,
                    log.getGateCode(),
                    log.getScannedAt()
            );
        }

        Booking booking = ticket.getBooking();

        return new QrScanResponse(
                "SUCCESS".equals(log.getScanResult()),
                log.getScanResult(),
                log.getMessage(),
                booking.getBookingReference(),
                booking.getDarshanSlot()
                        .getCategory().getType().name(),
                booking.getDarshanSlot()
                        .getSlotDate().toString(),
                booking.getVisitorCount(),
                log.getGateCode(),
                log.getScannedAt()
        );
    }
    
    @Override
    public List<QrScanResponse> getStaffScanHistory(String staffEmail) {

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        if (!"STAFF".equals(staff.getRole())
                || !Boolean.TRUE.equals(staff.getActive())) {
            throw new IllegalArgumentException(
                    "Only active staff members can access scan history"
            );
        }

        return qrScanLogRepository
                .findByScannedByIdOrderByScannedAtDesc(staff.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }
}

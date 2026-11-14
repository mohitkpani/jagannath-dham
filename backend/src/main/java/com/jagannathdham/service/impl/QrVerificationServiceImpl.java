
package com.jagannathdham.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jagannathdham.dto.QrScanRequest;
import com.jagannathdham.dto.QrScanResponse;
import com.jagannathdham.entity.Booking;
import com.jagannathdham.entity.QrScanLog;
import com.jagannathdham.entity.QrTicket;
import com.jagannathdham.entity.User;
import com.jagannathdham.enums.BookingStatus;
import com.jagannathdham.enums.PaymentStatus;
import com.jagannathdham.enums.QrScanResult;
import com.jagannathdham.exception.QrVerificationException;
import com.jagannathdham.repository.QrScanLogRepository;
import com.jagannathdham.repository.QrTicketRepository;
import com.jagannathdham.repository.UserRepository;
import com.jagannathdham.service.QrVerificationService;

@Service
public class QrVerificationServiceImpl implements QrVerificationService {

    private static final ZoneId INDIA_ZONE =
            ZoneId.of("Asia/Kolkata");

    private final QrTicketRepository qrTicketRepository;
    private final QrScanLogRepository qrScanLogRepository;
    private final UserRepository userRepository;

    public QrVerificationServiceImpl(
            QrTicketRepository qrTicketRepository,
            QrScanLogRepository qrScanLogRepository,
            UserRepository userRepository) {

        this.qrTicketRepository = qrTicketRepository;
        this.qrScanLogRepository = qrScanLogRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(noRollbackFor = QrVerificationException.class)
    public QrScanResponse verifyQrTicket(
            QrScanRequest request, String staffEmail) {

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() ->
                        new QrVerificationException(
                                "Staff account not found"));

        if (!"STAFF".equals(staff.getRole())
                || !Boolean.TRUE.equals(staff.getActive())) {

            throw new QrVerificationException(
                    "Only active staff members can verify QR tickets");
        }

        String tokenHash = hashToken(request.qrToken());

        Optional<QrTicket> optionalTicket =
                qrTicketRepository.findByTokenHashForUpdate(tokenHash);

        if (optionalTicket.isEmpty()) {

            saveScanLog(null, staff, request.gateCode(),
                    "INVALID_TOKEN", "QR token is not valid");

            throw new QrVerificationException("Invalid QR ticket");
        }

        QrTicket ticket = optionalTicket.get();
        Booking booking = ticket.getBooking();

        LocalDate today = LocalDate.now(INDIA_ZONE);

        LocalDate darshanDate =
                booking.getDarshanSlot().getSlotDate();

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {

            return reject(ticket, staff, request.gateCode(),
                    QrScanResult.CANCELLED,
                    "This booking has been cancelled");
        }

        if (darshanDate.isAfter(today)) {

            return reject(ticket, staff, request.gateCode(),
                    QrScanResult.NOT_YET_VALID,
                    "This ticket is valid only on its darshan date");
        }

        if (darshanDate.isBefore(today)) {

            return reject(ticket, staff, request.gateCode(),
                    QrScanResult.EXPIRED,
                    "This ticket has expired");
        }

        if (booking.getBookingStatus() != BookingStatus.CONFIRMED
                || booking.getPaymentStatus() != PaymentStatus.SUCCESS
                || !Boolean.TRUE.equals(ticket.getActive())) {

            saveScanLog(ticket, staff, request.gateCode(),
                    "REJECTED", "Ticket is not active or confirmed");

            throw new QrVerificationException(
                    "This ticket is not eligible for entry");
        }

        if (ticket.getUsedAt() != null) {

            return reject(ticket, staff, request.gateCode(),
                    QrScanResult.ALREADY_USED,
                    "This ticket has already been used");
        }

        LocalDateTime scannedAt =
                LocalDateTime.now(INDIA_ZONE);

        ticket.setUsedAt(scannedAt);
        ticket.setUsedBy(staff);

        qrTicketRepository.save(ticket);

        saveScanLog(ticket, staff, request.gateCode(),
                QrScanResult.SUCCESS.name(),
                "Entry approved");

        return new QrScanResponse(
                true,
                QrScanResult.SUCCESS.name(),
                "Entry approved",
                booking.getBookingReference(),
                booking.getDarshanSlot().getCategory()
                        .getType().name(),
                darshanDate.toString(),
                booking.getVisitorCount(),
                request.gateCode(),
                scannedAt
        );
    }

    private QrScanResponse reject(
            QrTicket ticket,
            User staff,
            String gateCode,
            QrScanResult result,
            String message) {

        Booking booking = ticket.getBooking();

        LocalDateTime scannedAt =
                LocalDateTime.now(INDIA_ZONE);

        saveScanLog(ticket, staff, gateCode,
                result.name(), message);

        return new QrScanResponse(
                false,
                result.name(),
                message,
                booking.getBookingReference(),
                booking.getDarshanSlot().getCategory()
                        .getType().name(),
                booking.getDarshanSlot().getSlotDate().toString(),
                booking.getVisitorCount(),
                gateCode,
                scannedAt
        );
    }

    private void saveScanLog(
            QrTicket ticket,
            User staff,
            String gateCode,
            String result,
            String message) {

        QrScanLog log = new QrScanLog();

        log.setQrTicket(ticket);
        log.setScannedBy(staff);
        log.setGateCode(gateCode);
        log.setScanResult(result);
        log.setMessage(message);
        log.setScannedAt(LocalDateTime.now(INDIA_ZONE));

        qrScanLogRepository.save(log);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hashBytes = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();

            for (byte b : hashBytes) {
                hash.append(String.format("%02x", b));
            }

            return hash.toString();

        } catch (Exception ex) {
            throw new RuntimeException(
                    "Unable to verify QR token", ex);
        }
    }
}


package com.jagannathdham.service.impl;

import java.io.ByteArrayOutputStream;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Base64;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.jagannathdham.entity.Booking;
import com.jagannathdham.entity.QrTicket;
import com.jagannathdham.enums.BookingStatus;
import com.jagannathdham.enums.PaymentStatus;
import com.jagannathdham.exception.BadRequestException;
import com.jagannathdham.exception.ResourceNotFoundException;
import com.jagannathdham.repository.QrTicketRepository;
import com.jagannathdham.service.QrTicketService;

@Service
public class QrTicketServiceImpl implements QrTicketService {

    private final QrTicketRepository qrTicketRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public QrTicketServiceImpl(QrTicketRepository qrTicketRepository) {
        this.qrTicketRepository = qrTicketRepository;
    }

    @Override
    @Transactional
    public String createTicket(Booking booking) {

        if (booking.getBookingStatus() != BookingStatus.CONFIRMED
                || booking.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new IllegalStateException(
                    "QR ticket can only be created for confirmed and paid bookings");
        }

        if (qrTicketRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new IllegalStateException("QR ticket already exists for this booking");
        }

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();

            for (byte b : hashBytes) {
                hash.append(String.format("%02x", b));
            }

            QrTicket ticket = new QrTicket();
            ticket.setBooking(booking);
            ticket.setTokenHash(hash.toString());
            ticket.setActive(true);
            // Generate and save the original QR image
            byte[] qrImage = generateQrImage(token);
            ticket.setQrImage(qrImage);
            qrTicketRepository.save(ticket);

            return token;

        } catch (Exception ex) {
            throw new RuntimeException("Unable to generate QR ticket", ex);
        }
    }
    

@Override
public byte[] generateQrImage(String token) {

    try {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        BitMatrix bitMatrix = qrCodeWriter.encode(
                token,
                BarcodeFormat.QR_CODE,
                300,
                300
        );

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        MatrixToImageWriter.writeToStream(
                bitMatrix,
                "PNG",
                outputStream
        );

        return outputStream.toByteArray();

    } catch (WriterException | java.io.IOException ex) {
        throw new RuntimeException("Unable to generate QR image", ex);
    }
}

@Override
public void deactivateTicket(Long bookingId) {

    QrTicket ticket = qrTicketRepository
            .findByBookingId(bookingId)
            .orElseThrow(() ->
                    new ResourceNotFoundException("QR ticket not found"));

    ticket.setActive(false);

    qrTicketRepository.save(ticket);
}

@Override
@Transactional(readOnly = true)
public byte[] getQrImageForUser(Long bookingId, String email) {

    QrTicket ticket = qrTicketRepository
            .findTicketForUser(bookingId, email)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "QR ticket not found"));

    Booking booking = ticket.getBooking();

    LocalDate today = LocalDate.now(
            ZoneId.of("Asia/Kolkata"));

    LocalDate darshanDate =
            booking.getDarshanSlot().getSlotDate();

    if (!Boolean.TRUE.equals(ticket.getActive())
            || ticket.getUsedAt() != null
            || booking.getBookingStatus() != BookingStatus.CONFIRMED
            || booking.getPaymentStatus() != PaymentStatus.SUCCESS
            || darshanDate.isBefore(today)) {

        throw new ResourceNotFoundException(
                "This QR ticket is no longer available");
    }

    if (ticket.getQrImage() == null
            || ticket.getQrImage().length == 0) {

        throw new ResourceNotFoundException(
                "QR image is not available for this booking");
    }

    return ticket.getQrImage();
}

@Override
@Transactional
public void ensureTicketNotUsed(Long bookingId) {

    QrTicket ticket = qrTicketRepository
            .findByBookingIdForUpdate(bookingId)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "QR ticket not found"));

    if (ticket.getUsedAt() != null) {
        throw new BadRequestException(
                "This booking cannot be cancelled because its QR ticket has already been used");
    }
}

@Override
@Transactional(readOnly = true)
public boolean isTicketUsed(Long bookingId) {

    return qrTicketRepository.findByBookingId(bookingId)
            .map(ticket -> ticket.getUsedAt() != null)
            .orElse(false);
}

}

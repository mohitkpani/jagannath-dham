
package com.jagannathdham.controller;

import java.security.Principal;
import java.util.List;

import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jagannathdham.dto.BookingRequest;
import com.jagannathdham.dto.PaymentVerificationRequest;
import com.jagannathdham.entity.Booking;
import com.jagannathdham.service.BookingService;
import com.jagannathdham.service.QrTicketService;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.jagannathdham.dto.BookingResponse;

@RestController
@RequestMapping("/api/bookings")
@Validated
public class BookingController {

    private final BookingService bookingService;
    private final QrTicketService qrTicketService;

    public BookingController(
            BookingService bookingService,
            QrTicketService qrTicketService) {
        this.bookingService = bookingService;
        this.qrTicketService = qrTicketService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<String> createBookingOrder(
            @Valid @RequestBody BookingRequest request,
            Principal principal) {

        JSONObject response = bookingService.createBookingOrder(
                request, principal.getName());

        return ResponseEntity.ok(response.toString());
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Booking> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request,
            Principal principal) {

        Booking booking = bookingService.verifyBookingPayment(
                request.orderId(),
                request.paymentId(),
                request.signature(),
                principal.getName());

        return ResponseEntity.ok(booking);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Long id) {

        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reference/{bookingReference}")
    public ResponseEntity<Booking> getBookingByReference(
            @PathVariable String bookingReference) {

        return bookingService.getBookingByReference(bookingReference)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                bookingService.cancelBooking(id));
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            Principal principal) {

        return ResponseEntity.ok(
                bookingService.getBookingsByUserEmail(principal.getName())
        );
    }
    
    @GetMapping("/{bookingId}/ticket/qr")
    public ResponseEntity<byte[]> getMyQrTicket(
            @PathVariable Long bookingId,
            Principal principal) {

        byte[] qrImage = qrTicketService.getQrImageForUser(
                bookingId, principal.getName());

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .body(qrImage);
    }
}

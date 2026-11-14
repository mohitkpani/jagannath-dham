
package com.jagannathdham.service;

import java.util.List;
import java.util.Optional;

import org.json.JSONObject;

import com.jagannathdham.dto.BookingRequest;
import com.jagannathdham.dto.BookingResponse;
import com.jagannathdham.entity.Booking;

public interface BookingService {

    JSONObject createBookingOrder(BookingRequest request, String userEmail);

    Booking verifyBookingPayment(
            String orderId,
            String paymentId,
            String signature,
            String userEmail
    );

    List<Booking> getAllBookings();

    Optional<Booking> getBookingById(Long id);

    Optional<Booking> getBookingByReference(String bookingReference);

    List<Booking> getBookingsByUser(Long userId);

    Booking cancelBooking(Long id);
    
    void releaseExpiredReservations();
    
    Booking reconcileCapturedPayment(String orderId, String paymentId);
    
    List<BookingResponse> getBookingsByUserEmail(String email);
}

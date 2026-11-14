
package com.jagannathdham.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jagannathdham.entity.Booking;
import com.jagannathdham.enums.BookingStatus;
import com.jagannathdham.enums.PaymentStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    Optional<Booking> findByRazorpayOrderId(String razorpayOrderId);

    List<Booking> findByUserId(Long userId);

    List<Booking> findByDarshanSlotId(Long darshanSlotId);

    // TiDB-compatible row-level locking query
    @Query(value = "SELECT * FROM bookings WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    long countByBookingStatus(BookingStatus bookingStatus);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    long countByBookedAtBetween(
            LocalDateTime start,
            LocalDateTime end);

    List<Booking> findTop10ByOrderByBookedAtDesc();
}

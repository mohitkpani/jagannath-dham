
package com.jagannathdham.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jagannathdham.entity.QrTicket;

public interface QrTicketRepository extends JpaRepository<QrTicket, Long> {

    Optional<QrTicket> findByBookingId(Long bookingId);

    Optional<QrTicket> findByTokenHash(String tokenHash);

    // TiDB-compatible locking query for QR scanning
    @Query(value = "SELECT * FROM qr_tickets WHERE token_hash = :tokenHash FOR UPDATE", nativeQuery = true)
    Optional<QrTicket> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash);

    // Get QR ticket belonging to a specific user
    @Query("""
                SELECT q FROM QrTicket q
                JOIN FETCH q.booking b
                JOIN FETCH b.darshanSlot ds
                WHERE b.id = :bookingId
                AND b.user.email = :email
            """)
    Optional<QrTicket> findTicketForUser(
            @Param("bookingId") Long bookingId,
            @Param("email") String email);

    // TiDB-compatible locking query for cancellation
    @Query(value = "SELECT * FROM qr_tickets WHERE booking_id = :bookingId FOR UPDATE", nativeQuery = true)
    Optional<QrTicket> findByBookingIdForUpdate(
            @Param("bookingId") Long bookingId);
}

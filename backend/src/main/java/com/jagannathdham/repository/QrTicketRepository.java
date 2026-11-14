
package com.jagannathdham.repository;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jagannathdham.entity.QrTicket;

public interface QrTicketRepository extends JpaRepository<QrTicket, Long> {

    Optional<QrTicket> findByBookingId(Long bookingId);

    Optional<QrTicket> findByTokenHash(String tokenHash);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM QrTicket q WHERE q.tokenHash = :tokenHash")
    Optional<QrTicket> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash);
    
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
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT q FROM QrTicket q
        WHERE q.booking.id = :bookingId
    """)
    Optional<QrTicket> findByBookingIdForUpdate(
            @Param("bookingId") Long bookingId);

}

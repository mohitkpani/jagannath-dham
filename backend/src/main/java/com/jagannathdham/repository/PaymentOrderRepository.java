
package com.jagannathdham.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jagannathdham.entity.PaymentOrder;
import com.jagannathdham.enums.PaymentStatus;

import jakarta.persistence.LockModeType;

public interface PaymentOrderRepository
        extends JpaRepository<PaymentOrder, Long> {

    Optional<PaymentOrder> findByRazorpayOrderId(String razorpayOrderId);

    List<PaymentOrder> findByReservationActiveTrueAndExpiresAtBefore(
            LocalDateTime currentTime);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PaymentOrder p WHERE p.razorpayOrderId = :orderId")
    Optional<PaymentOrder> findByRazorpayOrderIdForUpdate(
            @Param("orderId") String orderId);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentOrder p WHERE p.paymentStatus = :status")
    BigDecimal getTotalRevenueByPaymentStatus(
            @Param("status") PaymentStatus status);
    
    List<PaymentOrder> findByPaymentStatusAndCreatedAtBetween(
            PaymentStatus paymentStatus,
            LocalDateTime start,
            LocalDateTime end
    );
}

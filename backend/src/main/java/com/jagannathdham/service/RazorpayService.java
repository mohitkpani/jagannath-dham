
package com.jagannathdham.service;

import java.math.BigDecimal;
import com.razorpay.Payment;
import java.util.List;
import com.razorpay.Order;

public interface RazorpayService {

    Order createOrder(BigDecimal amount, String receipt);

    boolean verifyPayment(
            String orderId,
            String paymentId,
            String signature
    );

    boolean verifyCapturedPayment(
            String orderId,
            String paymentId,
            BigDecimal expectedAmount
    );
    
    List<Payment> fetchPaymentsForOrder(String orderId);
}


package com.jagannathdham.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.jagannathdham.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

@Service
public class RazorpayServiceImpl implements RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public RazorpayServiceImpl(RazorpayClient razorpayClient) {
        this.razorpayClient = razorpayClient;
    }

    @Override
    public Order createOrder(BigDecimal amount, String receipt) {

        try {
            JSONObject orderRequest = new JSONObject();

            int amountInPaise = amount
                    .multiply(BigDecimal.valueOf(100))
                    .intValueExact();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);

            return razorpayClient.orders.create(orderRequest);

        } catch (RazorpayException | ArithmeticException ex) {
            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + ex.getMessage(), ex);
        }
    }

    @Override
    public boolean verifyPayment(
            String orderId,
            String paymentId,
            String signature) {

        try {
            JSONObject paymentData = new JSONObject();

            paymentData.put("razorpay_order_id", orderId);
            paymentData.put("razorpay_payment_id", paymentId);
            paymentData.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(
                    paymentData, keySecret);

        } catch (RazorpayException ex) {
            return false;
        }
    }


@Override
public boolean verifyCapturedPayment(
        String orderId,
        String paymentId,
        BigDecimal expectedAmount) {

    try {
        Payment payment =
                razorpayClient.payments.fetch(paymentId);

        Object orderIdValue = payment.get("order_id");
        Object statusValue = payment.get("status");
        Object currencyValue = payment.get("currency");
        Object amountValue = payment.get("amount");

        String actualOrderId = orderIdValue.toString();
        String status = statusValue.toString();
        String currency = currencyValue.toString();

        int actualAmount = Integer.parseInt(
                amountValue.toString());

        int expectedAmountInPaise = expectedAmount
                .multiply(BigDecimal.valueOf(100))
                .intValueExact();

        return orderId.equals(actualOrderId)
                && "captured".equalsIgnoreCase(status)
                && "INR".equalsIgnoreCase(currency)
                && actualAmount == expectedAmountInPaise;

    } catch (RazorpayException | ArithmeticException
            | NumberFormatException ex) {
        return false;
    }

}

@Override
public List<Payment> fetchPaymentsForOrder(String orderId) {
    try {
        return razorpayClient.orders.fetchPayments(orderId);
    } catch (RazorpayException ex) {
        throw new RuntimeException(
                "Unable to fetch payments for Razorpay order: " + orderId, ex);
    }
}

}


package com.jagannathdham.service.impl;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.jagannathdham.service.BookingConfirmationEvent;
import com.jagannathdham.service.BookingCancellationEvent;
import com.jagannathdham.service.EmailService;

@Component
public class BookingEmailListener {

    private final EmailService emailService;

    public BookingEmailListener(EmailService emailService) {
        this.emailService = emailService;
    }

    // Send booking confirmation after transaction commits
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleBookingConfirmation(
            BookingConfirmationEvent event) {

        try {
            emailService.sendBookingConfirmation(
                    event.email(),
                    event.fullName(),
                    event.booking(),
                    event.qrImage()
            );

            System.out.println(
                    "Booking confirmation email sent: "
                    + event.booking().getBookingReference()
            );

        } catch (RuntimeException e) {
            System.err.println(
                    "Booking confirmation email failed: "
                    + e.getMessage()
            );
        }
    }

    // Send cancellation email after transaction commits
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleBookingCancellation(
            BookingCancellationEvent event) {

        try {
            emailService.sendBookingCancellation(
                    event.email(),
                    event.fullName(),
                    event.booking()
            );

            System.out.println(
                    "Booking cancellation email sent: "
                    + event.booking().getBookingReference()
            );

        } catch (RuntimeException e) {
            System.err.println(
                    "Booking cancellation email failed: "
                    + e.getMessage()
            );
        }
    }
}

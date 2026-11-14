
package com.jagannathdham.config;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.jagannathdham.service.BookingService;

@Component
public class BookingScheduler {

    private final BookingService bookingService;

    public BookingScheduler(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Runs every minute to check expired payment reservations.
    @Scheduled(fixedRate = 60000)
    public void processExpiredReservations() {
        bookingService.releaseExpiredReservations();
    }
}

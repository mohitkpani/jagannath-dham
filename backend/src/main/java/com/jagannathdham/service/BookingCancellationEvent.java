
package com.jagannathdham.service;

import com.jagannathdham.entity.Booking;

public record BookingCancellationEvent(
        String email,
        String fullName,
        Booking booking
) {
}

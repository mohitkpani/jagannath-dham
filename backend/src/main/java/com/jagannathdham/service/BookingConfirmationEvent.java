
package com.jagannathdham.service;

import com.jagannathdham.entity.Booking;

public record BookingConfirmationEvent(
        String email,
        String fullName,
        Booking booking,
        byte[] qrImage
) {
}

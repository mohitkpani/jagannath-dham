
package com.jagannathdham.service;

import com.jagannathdham.entity.Booking;

public interface EmailService {

    void sendRegistrationEmail(String email, String fullName);

    void sendBookingConfirmation(
            String email,
            String fullName,
            Booking booking,
            byte[] qrImage
    );

    void sendBookingCancellation(
            String email,
            String fullName,
            Booking booking
    );
    
    void sendSupportIssue(String userEmail, String issue);

}

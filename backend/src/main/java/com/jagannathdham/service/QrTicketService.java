
package com.jagannathdham.service;

import com.jagannathdham.entity.Booking;

public interface QrTicketService {

    String createTicket(Booking booking);

    byte[] generateQrImage(String token);
    
    void deactivateTicket(Long bookingId);
    
    byte[] getQrImageForUser(Long bookingId, String email);
    
    void ensureTicketNotUsed(Long bookingId);
    
    boolean isTicketUsed(Long bookingId);

}

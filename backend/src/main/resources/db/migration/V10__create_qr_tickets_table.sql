
-- Stores one secure QR ticket for each confirmed booking.
CREATE TABLE qr_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qr_ticket_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

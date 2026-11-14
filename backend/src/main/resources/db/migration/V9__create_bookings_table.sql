
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    darshan_slot_id BIGINT NOT NULL,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    visitor_count INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(100) NOT NULL UNIQUE,
    booked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_booking_slot
        FOREIGN KEY (darshan_slot_id) REFERENCES darshan_slots(id)
);

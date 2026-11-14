
CREATE TABLE payment_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,
    darshan_slot_id BIGINT NOT NULL,

    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,

    visitor_count INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_order_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_payment_order_slot
        FOREIGN KEY (darshan_slot_id) REFERENCES darshan_slots(id)
);

ALTER TABLE bookings
MODIFY COLUMN razorpay_order_id VARCHAR(255) NULL,
MODIFY COLUMN razorpay_payment_id VARCHAR(255) NULL;
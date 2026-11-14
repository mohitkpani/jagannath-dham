
ALTER TABLE payment_orders
ADD COLUMN expires_at DATETIME NULL;

ALTER TABLE payment_orders
ADD COLUMN reservation_active BOOLEAN NOT NULL DEFAULT TRUE;

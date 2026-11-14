
-- Add entry tracking to QR tickets
ALTER TABLE qr_tickets
ADD COLUMN used_at DATETIME NULL,
ADD COLUMN used_by_user_id BIGINT NULL;

ALTER TABLE qr_tickets
ADD CONSTRAINT fk_qr_ticket_used_by
FOREIGN KEY (used_by_user_id) REFERENCES users(id);

-- Store all QR scan attempts
CREATE TABLE qr_scan_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    qr_ticket_id BIGINT NULL,

    scanned_by_user_id BIGINT NOT NULL,

    gate_code VARCHAR(50) NOT NULL,

    scan_result VARCHAR(30) NOT NULL,

    message VARCHAR(255) NULL,

    scanned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qr_scan_ticket
        FOREIGN KEY (qr_ticket_id)
        REFERENCES qr_tickets(id),

    CONSTRAINT fk_qr_scan_user
        FOREIGN KEY (scanned_by_user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_qr_scan_ticket
ON qr_scan_logs(qr_ticket_id);

CREATE INDEX idx_qr_scan_date
ON qr_scan_logs(scanned_at);

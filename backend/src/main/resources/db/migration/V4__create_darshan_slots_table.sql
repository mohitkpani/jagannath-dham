CREATE TABLE darshan_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    category_id BIGINT NOT NULL,

    slot_date DATE NOT NULL,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    total_capacity INT NOT NULL,

    booked_count INT NOT NULL DEFAULT 0,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL,

    CONSTRAINT fk_darshan_slot_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
);
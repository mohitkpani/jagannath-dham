
ALTER TABLE darshan_slots
DROP COLUMN start_time,
DROP COLUMN end_time;

ALTER TABLE darshan_slots
ADD CONSTRAINT uk_category_slot_date
UNIQUE (category_id, slot_date);

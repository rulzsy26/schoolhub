-- Jalankan sekali pada database SchoolHub.
-- Ini memisahkan pengumuman dan kalender akademik berdasarkan sekolah.

ALTER TABLE announcements
  ADD COLUMN school_id INT NULL AFTER teacher_id;

ALTER TABLE announcements
  ADD KEY idx_announcements_school (school_id);

ALTER TABLE announcements
  ADD CONSTRAINT fk_announcements_school
  FOREIGN KEY (school_id) REFERENCES schools(id_school)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE academic_calendar
  ADD COLUMN school_id INT NULL AFTER created_by;

ALTER TABLE academic_calendar
  ADD KEY idx_academic_calendar_school (school_id);

ALTER TABLE academic_calendar
  ADD CONSTRAINT fk_academic_calendar_school
  FOREIGN KEY (school_id) REFERENCES schools(id_school)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Setelah migrasi, data lama bisa ditempatkan ke sekolah yang sesuai.
-- Default sementara untuk data lama:
UPDATE announcements SET school_id = 1 WHERE school_id IS NULL;
UPDATE academic_calendar SET school_id = 1 WHERE school_id IS NULL;

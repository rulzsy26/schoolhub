-- ============================================================
-- SchoolHub - Satu Akun Siswa untuk SMP + SMA
-- ============================================================
-- Jalankan SEKALI setelah db_migration_school_context.sql.
--
-- Sebelumnya:
--   UNIQUE(student_id)
--
-- Sekarang:
--   UNIQUE(student_id, class_id)
--
-- Dengan begitu satu akun siswa dapat memiliki:
--   SMP -> 8A
--   SMA -> X IPA 1
--
-- API SchoolHub tetap membatasi satu kelas per sekolah.
-- ============================================================

ALTER TABLE student_classes
  DROP INDEX unique_student_class;

ALTER TABLE student_classes
  ADD UNIQUE KEY unique_student_class (student_id, class_id);

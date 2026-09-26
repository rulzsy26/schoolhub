-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 26, 2026 at 07:29 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `schoolhub`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_calendar`
--

CREATE TABLE `academic_calendar` (
  `id_event` int NOT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `jenis` enum('Ujian','Libur','Kegiatan','Rapat','Pembelajaran') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kegiatan',
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `created_by` int NOT NULL,
  `school_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_calendar`
--

INSERT INTO `academic_calendar` (`id_event`, `judul`, `deskripsi`, `jenis`, `tanggal_mulai`, `tanggal_selesai`, `created_by`, `school_id`, `created_at`) VALUES
(1, 'Ujian Tengah Semester', 'Pelaksanaan UTS semester ganjil tahun ajaran 2026/2027.', 'Ujian', '2026-10-05', '2026-10-10', 1, NULL, '2026-09-22 15:53:59'),
(2, 'Rapat Guru', 'Rapat koordinasi guru dan evaluasi kegiatan pembelajaran.', 'Rapat', '2026-10-12', '2026-10-12', 1, NULL, '2026-09-22 15:53:59'),
(3, 'Peringatan Hari Sumpah Pemuda', 'Kegiatan sekolah dalam rangka memperingati Hari Sumpah Pemuda.', 'Kegiatan', '2026-10-28', '2026-10-28', 1, NULL, '2026-09-22 15:53:59');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id_announcement` int NOT NULL,
  `teacher_id` int NOT NULL,
  `school_id` int DEFAULT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id_announcement`, `teacher_id`, `school_id`, `judul`, `isi`, `created_at`) VALUES
(1, 1, NULL, 'Jadwal Ujian Tengah Semester', 'Berikut kami sampaikan jadwal UTS semester ganjil tahun ajaran 2026/2027. Mohon dipersiapkan dengan baik.', '2026-09-18 01:00:00'),
(2, 1, NULL, 'Rapat Guru', 'Rapat koordinasi guru akan dilaksanakan pada tanggal 22 September 2026 pukul 13.00 di ruang guru.', '2026-09-16 01:00:00'),
(3, 1, NULL, 'Peringatan Hari Sumpah Pemuda', 'Kegiatan upacara dalam rangka memperingati Hari Sumpah Pemuda akan dilaksanakan pada 28 Oktober 2026.', '2026-09-15 01:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id_assignment` int NOT NULL,
  `teacher_id` int NOT NULL,
  `class_id` int NOT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deadline` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id_assignment`, `teacher_id`, `class_id`, `judul`, `deskripsi`, `file_name`, `file_type`, `file_url`, `deadline`, `created_at`) VALUES
(1, 1, 1, 'Latihan Soal Persamaan Linear', 'Kerjakan latihan persamaan linear.', NULL, NULL, NULL, '2026-09-20 23:59:00', '2026-09-20 22:13:13'),
(4, 1, 1, 'Diskusi: Masalah Sosial di Lingkungan Sekolah', 'Diskusikan masalah sosial di lingkungan sekolah.', NULL, NULL, NULL, '2026-09-26 23:59:00', '2026-09-20 22:13:13'),
(7, 1, 4, 'kdflkmdf', 'kfmslkdfms', 'Kebutuhan Dasar Manusia .pdf', 'PDF', '/uploads/assignments/1790402459589-Kebutuhan_Dasar_Manusia_.pdf', '2026-09-26 16:00:00', '2026-09-26 06:00:59'),
(8, 1, 4, 'osfjklkfs', 'sjojlsmdfsv', 'Kebutuhan Dasar Manusia .pdf', 'PDF', '/uploads/assignments/1790402720218-Kebutuhan_Dasar_Manusia_.pdf', '2026-09-26 18:05:00', '2026-09-26 06:05:20'),
(9, 1, 4, 'djfjksffs', 'sfksksdv', 'Kebutuhan Dasar Manusia .pdf', 'PDF', '/uploads/assignments/1790403328692-Kebutuhan_Dasar_Manusia_.pdf', '2026-09-27 13:15:00', '2026-09-26 06:15:28');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id_attendance` int NOT NULL,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `tanggal` date NOT NULL,
  `status` enum('hadir','izin','sakit','alpa') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'alpa',
  `catatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id_attendance`, `class_id`, `student_id`, `tanggal`, `status`, `catatan`, `created_at`, `updated_at`) VALUES
(1, 1, 3, '2026-09-23', 'hadir', NULL, '2026-09-23 16:15:41', '2026-09-23 16:15:53'),
(2, 1, 2, '2026-09-23', 'sakit', NULL, '2026-09-23 16:15:41', '2026-09-23 16:15:53'),
(7, 1, 3, '2026-09-25', 'hadir', NULL, '2026-09-25 03:02:04', '2026-09-25 03:02:04'),
(8, 1, 2, '2026-09-25', 'hadir', NULL, '2026-09-25 03:02:04', '2026-09-25 03:02:04');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id_class` int NOT NULL,
  `school_id` int DEFAULT NULL,
  `nama_kelas` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tingkat` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wali_kelas` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id_class`, `school_id`, `nama_kelas`, `tingkat`, `wali_kelas`, `created_at`) VALUES
(1, 1, '9A', '9', 1, '2026-09-20 22:13:13'),
(3, 1, '8A', '8', 1, '2026-09-20 22:13:13'),
(4, 1, '7A', '7', 1, '2026-09-23 03:05:13'),
(5, 1, '7D', '7', 1, '2026-09-23 03:05:36'),
(6, 2, 'X IPA 1', '10', 1, '2026-09-24 09:55:40'),
(7, 2, 'X IPS 1', '10', 1, '2026-09-24 09:55:40'),
(8, 2, 'XI IPA 1', '11', 1, '2026-09-24 09:55:40'),
(9, 2, 'XI IPS 1', '11', 1, '2026-09-24 09:55:40'),
(10, 2, 'XII IPA 1', '12', 1, '2026-09-24 09:55:40'),
(11, 2, 'XII IPS 1', '12', 1, '2026-09-24 09:55:40'),
(12, 2, '10A', '9', 1, '2026-09-24 13:00:33');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id_grade` int NOT NULL,
  `submission_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `nilai` decimal(5,2) NOT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `graded_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id_grade`, `submission_id`, `teacher_id`, `nilai`, `feedback`, `graded_at`) VALUES
(1, 1, 1, 85.00, 'Perbaiki lagi sesuai dengan ketentuan', '2026-09-25 10:01:30');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id_material` int NOT NULL,
  `teacher_id` int NOT NULL,
  `class_id` int NOT NULL,
  `judul` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id_material`, `teacher_id`, `class_id`, `judul`, `deskripsi`, `file_name`, `file_type`, `file_url`, `created_at`) VALUES
(2, 1, 1, 'Video Pembelajaran Interaksi Sosial', 'Video pembelajaran interaksi sosial.', 'interaksi-sosial.mp4', 'Video', '/files/interaksi-sosial.mp4', '2026-09-20 22:13:13'),
(5, 1, 1, 'Bahasa Indonesia', 'Kisi-Kisi Materi UTS Semester Ganjil 2026/2027', 'RANGKUMAN UJIAN BAHASA INDONESIA KELAS 8 semester 1.pdf', 'application/pdf', '/uploads/materials/1790135537957-RANGKUMAN_UJIAN_BAHASA_INDONESIA_KELAS_8_semester_1.pdf', '2026-09-23 03:52:17'),
(6, 1, 12, 'Kisi-Kisi UTS IPA', '', 'Rangkuman IPA 8 Semester 1.pdf', 'application/pdf', '/uploads/materials/1790254985409-Rangkuman_IPA_8_Semester_1.pdf', '2026-09-24 13:03:05'),
(7, 1, 1, 'Video Materi Calistung', '', 'video-02.mp4', 'video/mp4', '/uploads/materials/1790306267095-video-02.mp4', '2026-09-25 03:17:47'),
(8, 1, 12, 'Video Materi Kerajaan di Indonesia', 'Silahkan tonton video berikut dengan seksama', 'video-02.mp4', 'video/mp4', '/uploads/materials/1790306689106-video-02.mp4', '2026-09-25 03:24:49'),
(12, 1, 5, 'Kebutuhan Manusia', 'Materi 1', 'Kebutuhan Dasar Manusia .pptx', 'PPTX', '/uploads/materials/1790319363301-Kebutuhan_Dasar_Manusia_.pptx', '2026-09-25 06:56:03'),
(13, 1, 5, 'Kebutuhan Manusia 1', 'Materi 1', 'Kebutuhan Dasar Manusia  (1).pdf', 'PDF', '/uploads/materials/1790319715739-Kebutuhan_Dasar_Manusia___1_.pdf', '2026-09-25 07:01:55');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id_schedule` int NOT NULL,
  `teacher_id` int NOT NULL,
  `class_id` int NOT NULL,
  `hari` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `mata_pelajaran` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruang` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id_schedule`, `teacher_id`, `class_id`, `hari`, `jam_mulai`, `jam_selesai`, `mata_pelajaran`, `ruang`) VALUES
(1, 1, 1, 'Senin', '07:00:00', '08:20:00', 'IPS', 'Ruang 9A');

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id_school` int NOT NULL,
  `nama_sekolah` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenjang` enum('SMP','SMA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id_school`, `nama_sekolah`, `jenjang`, `slug`, `created_at`) VALUES
(1, 'SMP Negeri 3 Jakarta', 'SMP', 'smp-negeri-3-jakarta', '2026-09-24 09:37:44'),
(2, 'SMA Negeri 37 Jakarta', 'SMA', 'sma-negeri-37-jakarta', '2026-09-24 09:37:44');

-- --------------------------------------------------------

--
-- Table structure for table `student_classes`
--

CREATE TABLE `student_classes` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `class_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_classes`
--

INSERT INTO `student_classes` (`id`, `student_id`, `class_id`) VALUES
(10, 9, 4),
(8, 10, 4),
(9, 11, 4),
(16, 12, 12),
(18, 25, 1),
(17, 25, 12);

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id_submission` int NOT NULL,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('submitted','late','graded') COLLATE utf8mb4_unicode_ci DEFAULT 'submitted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id_submission`, `assignment_id`, `student_id`, `file_name`, `file_url`, `catatan`, `submitted_at`, `status`) VALUES
(1, 1, 2, 'Rangkuman ATS Ganjil PPKn Kelas 8.pdf', '/uploads/submissions/1790305224035-2-Rangkuman_ATS_Ganjil_PPKn_Kelas_8.pdf', '', '2026-09-25 10:00:24', 'graded'),
(2, 7, 9, 'Kebutuhan Dasar Manusia  (1).pdf', '/uploads/submissions/1790406256276-9-Kebutuhan_Dasar_Manusia___1_.pdf', 'fsdfshtgrt', '2026-09-26 14:04:16', 'submitted');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_classes`
--

CREATE TABLE `teacher_classes` (
  `id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `class_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teacher_classes`
--

INSERT INTO `teacher_classes` (`id`, `teacher_id`, `class_id`) VALUES
(1, 1, 1),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 12);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_lengkap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `jenjang` enum('SMP','SMA','Guru') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SMP',
  `jenis_kelamin` enum('Laki-laki','Perempuan') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `username`, `email`, `password`, `nama_lengkap`, `role`, `jenjang`, `jenis_kelamin`, `foto`, `created_at`, `updated_at`) VALUES
(1, 'yurla', 'yurla@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Yurni Latifah', 'admin', 'Guru', 'Perempuan', NULL, '2026-09-20 22:13:13', '2026-09-25 04:38:13'),
(2, 'rafi', 'rafi@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Rafi Ahmad', 'user', 'SMP', 'Laki-laki', NULL, '2026-09-20 22:13:13', '2026-09-20 22:13:13'),
(3, 'nabila', 'nabila@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Nabila Putri', 'user', 'SMP', 'Perempuan', NULL, '2026-09-20 22:13:13', '2026-09-20 22:13:13'),
(9, 'andi', 'andi@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Andi Pratama', 'user', 'SMP', 'Laki-laki', NULL, '2026-09-24 08:18:58', '2026-09-24 08:18:58'),
(10, 'siti', 'siti@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Siti Aulia', 'user', 'SMP', 'Perempuan', NULL, '2026-09-24 08:18:58', '2026-09-24 08:18:58'),
(11, 'fajar', 'fajar@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Fajar Ramadhan', 'user', 'SMP', 'Laki-laki', NULL, '2026-09-24 08:18:58', '2026-09-24 08:18:58'),
(12, 'rizky', 'rizky@schoolhub.test', '$2b$10$QEu8LEM4E78OAK6baejaq.5soIRBdrZ.5xAO6u/Ae4Kpv/GaHTUDq', 'Rizky Maulana', 'user', 'SMA', 'Laki-laki', NULL, '2026-09-24 08:18:58', '2026-09-24 08:18:58'),
(25, 'daffa', 'daffa@schoolhub.test', '$2b$10$47k0Zo6YnvJcn1PCkja/9OfXrHpiX1rJvt94OfztVBfgm65qewUKi', 'Daffa Alfarizi', 'user', 'SMA', 'Laki-laki', NULL, '2026-09-24 13:26:08', '2026-09-24 13:26:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_calendar`
--
ALTER TABLE `academic_calendar`
  ADD PRIMARY KEY (`id_event`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_academic_dates` (`tanggal_mulai`,`tanggal_selesai`),
  ADD KEY `idx_calendar_school` (`school_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id_announcement`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `idx_announcements_school` (`school_id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id_assignment`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id_attendance`),
  ADD UNIQUE KEY `uq_attendance_student_date` (`class_id`,`student_id`,`tanggal`),
  ADD UNIQUE KEY `unique_attendance` (`class_id`,`student_id`,`tanggal`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id_class`),
  ADD KEY `wali_kelas` (`wali_kelas`),
  ADD KEY `fk_classes_school` (`school_id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id_grade`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id_material`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id_schedule`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id_school`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_class` (`student_id`,`class_id`),
  ADD UNIQUE KEY `unique_student_class` (`student_id`,`class_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id_submission`),
  ADD UNIQUE KEY `uq_submission` (`assignment_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `teacher_classes`
--
ALTER TABLE `teacher_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_teacher_class` (`teacher_id`,`class_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_calendar`
--
ALTER TABLE `academic_calendar`
  MODIFY `id_event` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id_announcement` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id_assignment` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id_attendance` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id_class` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id_grade` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id_material` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id_schedule` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id_school` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_classes`
--
ALTER TABLE `student_classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id_submission` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `teacher_classes`
--
ALTER TABLE `teacher_classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `academic_calendar`
--
ALTER TABLE `academic_calendar`
  ADD CONSTRAINT `academic_calendar_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_calendar_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id_school`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_announcements_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id_school`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id_class`) ON DELETE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id_class`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`wali_kelas`) REFERENCES `users` (`id_user`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_classes_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id_school`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id_submission`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `materials_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id_class`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id_class`) ON DELETE CASCADE;

--
-- Constraints for table `student_classes`
--
ALTER TABLE `student_classes`
  ADD CONSTRAINT `student_classes_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id_class`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id_assignment`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_classes`
--
ALTER TABLE `teacher_classes`
  ADD CONSTRAINT `teacher_classes_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_classes_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id_class`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

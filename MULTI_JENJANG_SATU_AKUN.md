# SchoolHub - Perubahan Multi-Jenjang Satu Akun Siswa

Perubahan pada ZIP ini menerapkan konsep:

- Satu akun siswa dapat digunakan untuk SMP dan SMA.
- Pilihan `SMP` / `SMA` pada login menjadi sekolah aktif (school context), bukan filter permanen pada akun.
- Siswa dapat berpindah sekolah melalui dropdown sekolah di Header tanpa membuat akun baru.
- Data dashboard, materi, tugas, nilai, kalender, absensi, profil, pencarian, dan notifikasi mengikuti `school_id` aktif.
- Guru tetap dapat berpindah antara SMP Negeri 3 Jakarta dan SMA Negeri 37 Jakarta.
- Satu siswa dapat mempunyai kelas di SMP dan kelas di SMA.
- Dalam satu sekolah, API mencegah siswa memiliki lebih dari satu kelas.

## Migrasi database

Jalankan file:

`db_migration_multi_school_student.sql`

setelah migrasi school context sebelumnya sudah dijalankan.

Migrasi ini mengubah unique key `student_classes` dari:

`UNIQUE(student_id)`

menjadi:

`UNIQUE(student_id, class_id)`

Pastikan file `db_migration_school_context.sql` sudah pernah dijalankan pada database yang memiliki kolom `school_id` di `announcements` dan `academic_calendar`.

## Contoh

Satu akun:

`Rizky Maulana`

dapat memiliki:

- SMP Negeri 3 Jakarta -> 8A
- SMA Negeri 37 Jakarta -> X IPA 1

Tidak perlu membuat akun Rizky kedua.

## Login

Siswa tetap memilih:

- SMP -> SMP Negeri 3 Jakarta
- SMA -> SMA Negeri 37 Jakarta

Guru memilih:

- Guru

Setelah login, pilihan SMP/SMA menjadi school context aktif dan dapat diganti melalui dropdown sekolah di Header.

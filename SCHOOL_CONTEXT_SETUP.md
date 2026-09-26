# School Context – SchoolHub

Fitur ini menambahkan konteks sekolah untuk Guru/Admin:

- SMP Negeri 3 Jakarta → `/school/smp-negeri-3-jakarta/...`
- SMA Negeri 37 Jakarta → `/school/sma-negeri-37-jakarta/...`

Halaman yang dipisahkan:

- Dashboard
- My Classes
- Learning Materials
- Assignments
- Penilaian Tugas
- Absensi
- Calendar
- Profile
- Pengaturan Akun

## 1. Jalankan migrasi database

Jalankan file `db_migration_school_context.sql` satu kali pada database SchoolHub.

Migrasi menambahkan `school_id` pada `announcements` dan `academic_calendar`, sehingga pengumuman dan kalender juga benar-benar terpisah antar sekolah.

## 2. Pastikan data kelas SMA sudah tersedia

Kelas SMA harus memiliki `classes.school_id = 2` dan guru yang sama harus memiliki mapping pada `teacher_classes`.

## 3. Cara kerja

Pemilihan sekolah disimpan sebagai cookie `schoolhub_school_id`. Semua API utama membaca konteks tersebut dan membatasi data berdasarkan `classes.school_id` atau `school_id`.

Sidebar dan menu mobile otomatis menggunakan URL sekolah aktif. Jadi saat pindah dari SMP ke SMA, bukan hanya nama sekolah yang berubah; URL dan data halaman ikut berpindah konteks.

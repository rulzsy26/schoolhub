# SchoolHub - Aturan Final Multi-Jenjang Siswa

- Satu akun siswa dapat dipakai untuk SMP dan SMA.
- Siswa memilih SMP/SMA hanya pada halaman login.
- Header siswa tidak memiliki dropdown sekolah.
- Untuk berpindah jenjang, siswa wajib logout lalu login kembali dan memilih jenjang.
- Cookie `schoolhub_school_id` menyimpan sekolah aktif selama sesi/login tersebut.
- Middleware mencegah siswa membuka URL sekolah lain tanpa login ulang.
- Guru/admin tetap dapat berpindah sekolah melalui dropdown Header.
- Materi, tugas, nilai, kalender, pengumuman, notifikasi, kelas, dan dashboard mengikuti sekolah aktif.
- Materi/tugas/notifikasi/dashboard siswa juga dibatasi ke kelas yang diikuti pada sekolah aktif.

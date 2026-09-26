# SchoolHub — Student/User Functional Patch

Patch ini mengaktifkan fungsi role `user` / siswa.

## Fitur siswa
- Dashboard siswa dinamis dari MySQL
- Learning Materials: melihat dan membuka materi sesuai kelas siswa
- Assignments: melihat tugas dan deadline
- Submit Assignment: upload file maksimal 15 MB + catatan
- Resubmit jika belum dinilai
- Grades: melihat nilai dan feedback
- Calendar: kalender akademik (read-only untuk siswa)
- Profile: menggunakan API profile yang sudah ada
- Announcements: ditampilkan di dashboard siswa

## API
- GET /api/materials → admin/user sesuai role
- GET /api/assignments → admin/user sesuai role
- POST /api/submissions → siswa mengumpulkan tugas
- GET /api/submissions → daftar pengumpulan siswa
- GET /api/grades → admin/user sesuai role
- GET /api/announcements → admin/user sesuai role
- GET /api/academic-calendar → admin/user
- POST/DELETE /api/academic-calendar → admin only

## Database
Tidak ada tabel baru untuk tugas/pengumpulan/nilai karena tabel tersebut sudah ada.
Jika fitur Kalender Akademik dari patch sebelumnya belum dipasang, jalankan:
`db/migration_academic_calendar.sql`

## Cara pasang
Jangan replace seluruh project. Copy file di patch ke project SchoolHub dengan struktur folder yang sama.
Kemudian restart:

Ctrl + C
npm run dev

# SchoolHub

Starter project sistem informasi sekolah berbasis Next.js + MySQL dengan 2 role:
- `admin` = Guru
- `user` = Siswa

Dashboard sudah dibuat mengikuti dua referensi UI yang diberikan: dashboard guru dan dashboard siswa.

## 1. Persiapan

Pastikan sudah terinstall:
- Node.js 20+
- MySQL / Laragon
- npm

## 2. Install

```bash
npm install
```

## 3. Database

Import:

```text
db/schema.sql
db/seed.sql
```

Jika memakai Laragon, bisa lewat HeidiSQL/phpMyAdmin.

## 4. Environment

Copy `.env.example` menjadi `.env.local`, lalu sesuaikan:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=schoolhub
DB_PORT=3306
JWT_SECRET=ganti-dengan-secret-sendiri
```

## 5. Jalankan

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Demo login

### Guru / Admin
- Email: `budi@schoolhub.test`
- Password: `password123`

### Siswa / User
- Email: `rafi@schoolhub.test`
- Password: `password123`

## Catatan

Versi ini adalah **functional starter/MVP**: login/session, role, layout, dashboard guru/siswa, halaman classes/materials/assignments/grades/calendar/profile, API auth dan API dashboard, serta schema + seed MySQL sudah disiapkan.

CRUD database untuk halaman operasional dapat dilanjutkan dari struktur API dan tabel yang sudah tersedia.

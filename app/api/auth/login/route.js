import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";

const SCHOOL_BY_JENJANG = {
  SMP: {
    id: 1,
    slug: "smp-negeri-3-jakarta",
    name: "SMP Negeri 3 Jakarta",
  },
  SMA: {
    id: 2,
    slug: "sma-negeri-37-jakarta",
    name: "SMA Negeri 37 Jakarta",
  },
};

export async function POST(request) {
  try {
    const { identifier, password, jenjang } = await request.json();

    if (!identifier || !password || !jenjang) {
      return NextResponse.json(
        {
          message: "Email/username, password, dan jenjang wajib diisi.",
        },
        { status: 400 },
      );
    }

    const allowedJenjang = ["SMP", "SMA", "Guru"];

    if (!allowedJenjang.includes(jenjang)) {
      return NextResponse.json(
        { message: "Jenjang sekolah tidak valid." },
        { status: 400 },
      );
    }

    // ------------------------------------------------------
    // AKUN GURU
    // Guru tetap login sebagai role admin/Guru.
    // ------------------------------------------------------
    let rows;

    if (jenjang === "Guru") {
      [rows] = await db.query(
        `
        SELECT *
        FROM users
        WHERE
          (email = ? OR username = ?)
          AND role = 'admin'
          AND jenjang = 'Guru'
        LIMIT 1
        `,
        [identifier, identifier],
      );
    } else {
      // ----------------------------------------------------
      // AKUN SISWA
      //
      // Jenjang di form login SEKARANG ADALAH PILIHAN
      // SEKOLAH AKTIF, BUKAN FILTER IDENTITAS AKUN.
      //
      // Jadi satu akun siswa bisa memilih SMP maupun SMA.
      // ----------------------------------------------------
      [rows] = await db.query(
        `
        SELECT *
        FROM users
        WHERE
          (email = ? OR username = ?)
          AND role = 'user'
        LIMIT 1
        `,
        [identifier, identifier],
      );
    }

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        {
          message: "Akun tidak ditemukan.",
        },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Password salah." },
        { status: 401 },
      );
    }

    await setSession(user);

    const response = NextResponse.json({
      user: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        role: user.role,
        jenjang: user.jenjang,
      },
      school:
        jenjang === "Guru"
          ? null
          : SCHOOL_BY_JENJANG[jenjang],
    });

    // Pilihan SMP/SMA menjadi school context aktif.
    if (jenjang !== "Guru") {
      const school = SCHOOL_BY_JENJANG[jenjang];

      response.cookies.set(
        "schoolhub_school_id",
        String(school.id),
        {
          httpOnly: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        },
      );
    }

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Database belum terhubung. Pastikan .env.local dan MySQL sudah benar.",
        error: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}

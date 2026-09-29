import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const me = url.searchParams.get("me") === "1";

    // ==========================================
    // USER YANG SEDANG LOGIN
    // Dipakai untuk Pengaturan Akun
    // ==========================================
    if (me) {
      const [rows] = await db.query(
        `
        SELECT
          u.id_user,
          u.nama_lengkap,
          u.username,
          u.email,
          u.jenis_kelamin,
          u.foto,
          u.role,
          u.jenjang
        FROM users u
        WHERE u.id_user = ?
        LIMIT 1
        `,
        [session.id_user],
      );

      if (!rows.length) {
        return NextResponse.json(
          { message: "Data akun tidak ditemukan." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        user: rows[0],
        viewerRole: session.role,
      });
    }

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    let rows = [];

    // ==========================================
    // GURU
    // Guru melihat profil dirinya sendiri
    // ==========================================
    if (session.role === "admin") {
      [rows] = await db.query(
        `
        SELECT
          u.id_user,
          u.nama_lengkap,
          u.username,
          u.email,
          u.jenis_kelamin,
          u.foto,
          u.role,

          GROUP_CONCAT(
            DISTINCT c.nama_kelas
            ORDER BY c.nama_kelas
            SEPARATOR ', '
          ) AS kelas_diampu

        FROM users u

        LEFT JOIN teacher_classes tc
          ON tc.teacher_id = u.id_user

        LEFT JOIN classes c
          ON c.id_class = tc.class_id
          AND c.school_id = ?

        WHERE u.id_user = ?

        GROUP BY
          u.id_user,
          u.nama_lengkap,
          u.username,
          u.email,
          u.jenis_kelamin,
          u.foto,
          u.role
        `,
        [schoolId, session.id_user],
      );
    }

    // ==========================================
    // SISWA
    // Siswa melihat guru dari kelasnya
    // ==========================================
    else {
      [rows] = await db.query(
        `
        SELECT
          u.id_user,
          u.nama_lengkap,
          u.username,
          u.email,
          u.jenis_kelamin,
          u.foto,
          u.role,

          GROUP_CONCAT(
            DISTINCT c2.nama_kelas
            ORDER BY c2.nama_kelas
            SEPARATOR ', '
          ) AS kelas_diampu

        FROM student_classes sc

        INNER JOIN classes c
          ON c.id_class = sc.class_id

        INNER JOIN teacher_classes tc
          ON tc.class_id = c.id_class

        INNER JOIN users u
          ON u.id_user = tc.teacher_id

        LEFT JOIN teacher_classes tc2
          ON tc2.teacher_id = u.id_user

        LEFT JOIN classes c2
          ON c2.id_class = tc2.class_id
          AND c2.school_id = ?

        WHERE
          sc.student_id = ?
          AND c.school_id = ?
          AND u.role = 'admin'

        GROUP BY
          u.id_user,
          u.nama_lengkap,
          u.username,
          u.email,
          u.jenis_kelamin,
          u.foto,
          u.role

        LIMIT 1
        `,
        [schoolId, session.id_user, schoolId],
      );
    }

    // ==========================================
    // TIDAK DITEMUKAN
    // ==========================================
    if (!rows.length) {
      return NextResponse.json(
        {
          message:
            session.role === "admin"
              ? "Data profil guru tidak ditemukan."
              : "Guru untuk kelas kamu belum tersedia.",
        },
        { status: 404 },
      );
    }

    const user = rows[0];

    return NextResponse.json({
      user,
      viewerRole: session.role,
    });
  } catch (error) {
    console.error("=================================");
    console.error("PROFILE ERROR");
    console.error("MESSAGE:", error?.message);
    console.error("CODE:", error?.code);
    console.error("SQL MESSAGE:", error?.sqlMessage);
    console.error("SQL:", error?.sql);
    console.error("=================================");

    return NextResponse.json(
      {
        message:
          error?.sqlMessage || error?.message || "Gagal mengambil data profil.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// PUT
// UPDATE AKUN + FOTO PROFIL
// =====================================================

export async function PUT(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const file = formData.get("foto");

    // ==========================================
    // VALIDASI EMAIL
    // ==========================================

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi." },
        { status: 400 },
      );
    }

    // ==========================================
    // CEK EMAIL DIPAKAI USER LAIN
    // ==========================================

    const [emailRows] = await db.query(
      `
      SELECT id_user
      FROM users
      WHERE email = ?
        AND id_user <> ?
      LIMIT 1
      `,
      [email, session.id_user],
    );

    if (emailRows.length) {
      return NextResponse.json(
        { message: "Email sudah digunakan akun lain." },
        { status: 400 },
      );
    }

    // ==========================================
    // FOTO
    // ==========================================

    let fotoUrl = null;

    if (file && typeof file !== "string" && file.size > 0) {
      // Maksimal 5 MB
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Ukuran foto maksimal 5 MB." },
          { status: 400 },
        );
      }

      // Hanya gambar
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "File yang dipilih harus berupa gambar." },
          { status: 400 },
        );
      }

      const extension = file.name?.split(".").pop()?.toLowerCase() || "jpg";

      const blob = await put(
        `profiles/${session.id_user}-${Date.now()}.${extension}`,
        file,
        {
          access: "public",
          addRandomSuffix: true,
        },
      );

      fotoUrl = blob.url;
    }

    // ==========================================
    // UPDATE DATABASE
    // ==========================================

    const updates = ["email = ?"];
    const values = [email];

    // Update foto kalau user upload foto baru
    if (fotoUrl) {
      updates.push("foto = ?");
      values.push(fotoUrl);
    }

    // Update password kalau diisi
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Password minimal 6 karakter." },
          { status: 400 },
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      updates.push("password = ?");
      values.push(hashedPassword);
    }

    values.push(session.id_user);

    await db.query(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id_user = ?
      `,
      values,
    );

    return NextResponse.json({
      message: fotoUrl
        ? "Pengaturan akun dan foto profil berhasil diperbarui."
        : "Pengaturan akun berhasil diperbarui.",
      foto: fotoUrl,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return NextResponse.json(
      {
        message: error?.message || "Gagal memperbarui pengaturan akun.",
      },
      { status: 500 },
    );
  }
}

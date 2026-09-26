import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
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

    // ==========================================
    // RESPONSE
    // ==========================================
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

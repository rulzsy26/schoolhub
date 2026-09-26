import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const q = String(new URL(request.url).searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const like = `%${q}%`;
    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
    let results = [];

    /* =====================================================
       GURU / ADMIN
    ===================================================== */
    if (session.role === "admin") {
      /* =========================
         SISWA
      ========================= */
      const [students] = await db.query(
        `
        SELECT DISTINCT
          u.id_user AS id,
          'Siswa' AS type,
          u.nama_lengkap AS title,
          CONCAT(
            'Siswa • ',
            COALESCE(c.nama_kelas, 'Belum ada kelas')
          ) AS subtitle,
          '/classes' AS href
        FROM users u

        LEFT JOIN student_classes sc
          ON sc.student_id = u.id_user

        LEFT JOIN classes c
          ON c.id_class = sc.class_id

        WHERE
          u.role = 'user'
          AND c.school_id = ?
          AND (
            u.nama_lengkap LIKE ?
            OR COALESCE(u.username, '') LIKE ?
            OR COALESCE(u.email, '') LIKE ?
          )

        ORDER BY u.nama_lengkap ASC
        LIMIT 10
        `,
        [schoolId, like, like, like],
      );

      /* =========================
         KELAS
      ========================= */
      const [classes] = await db.query(
        `
        SELECT
          c.id_class AS id,
          'Kelas' AS type,
          c.nama_kelas AS title,
          CONCAT(
            'Kelas ',
            c.tingkat
          ) AS subtitle,
          '/classes' AS href
        FROM classes c

        INNER JOIN teacher_classes tc
          ON tc.class_id = c.id_class

        WHERE
          tc.teacher_id = ?
          AND c.school_id = ?
          AND (
            c.nama_kelas LIKE ?
            OR c.tingkat LIKE ?
          )

        ORDER BY
          c.tingkat DESC,
          c.nama_kelas ASC

        LIMIT 10
        `,
        [session.id_user, schoolId, like, like],
      );

      /* =========================
         MATERI
      ========================= */
      const [materials] = await db.query(
        `
        SELECT
          m.id_material AS id,
          'Materi' AS type,
          m.judul AS title,
          CONCAT(
            'Materi • ',
            COALESCE(c.nama_kelas, 'Umum')
          ) AS subtitle,
          '/materials' AS href

        FROM materials m

        LEFT JOIN classes c
          ON c.id_class = m.class_id

        WHERE
          m.teacher_id = ?
          AND c.school_id = ?
          AND (
            m.judul LIKE ?
            OR COALESCE(m.deskripsi, '') LIKE ?
            OR COALESCE(m.file_name, '') LIKE ?
          )

        ORDER BY m.created_at DESC

        LIMIT 10
        `,
        [session.id_user, schoolId, like, like, like],
      );

      /* =========================
         TUGAS
      ========================= */
      const [assignments] = await db.query(
        `
        SELECT
          a.id_assignment AS id,
          'Tugas' AS type,
          a.judul AS title,
          CONCAT(
            'Tugas • ',
            COALESCE(c.nama_kelas, 'Umum')
          ) AS subtitle,
          '/assignments' AS href

        FROM assignments a

        LEFT JOIN classes c
          ON c.id_class = a.class_id

        WHERE
          a.teacher_id = ?
          AND c.school_id = ?
          AND (
            a.judul LIKE ?
            OR COALESCE(a.deskripsi, '') LIKE ?
          )

        ORDER BY a.deadline ASC

        LIMIT 10
        `,
        [session.id_user, schoolId, like, like],
      );

      /* =========================
         PENGUMUMAN
      ========================= */
      const [announcements] = await db.query(
        `
        SELECT
          id_announcement AS id,
          'Pengumuman' AS type,
          judul AS title,
          'Pengumuman sekolah' AS subtitle,
          '/announcements' AS href

        FROM announcements

        WHERE
          teacher_id = ?
          AND school_id = ?
          AND (
            judul LIKE ?
            OR COALESCE(isi, '') LIKE ?
          )

        ORDER BY created_at DESC

        LIMIT 10
        `,
        [session.id_user, schoolId, like, like],
      );

      results = [
        ...students,
        ...classes,
        ...materials,
        ...assignments,
        ...announcements,
      ];
    } else {

    /* =====================================================
       SISWA / USER
    ===================================================== */
      /* =========================
         MATERI
      ========================= */
      const [materials] = await db.query(
        `
        SELECT
          m.id_material AS id,
          'Materi' AS type,
          m.judul AS title,
          CONCAT(
            'Materi • ',
            COALESCE(c.nama_kelas, 'Umum')
          ) AS subtitle,
          '/materials' AS href

        FROM materials m

        LEFT JOIN classes c
          ON c.id_class = m.class_id

        INNER JOIN student_classes sc
          ON sc.class_id = m.class_id
          AND sc.student_id = ?

        WHERE
          c.school_id = ?
          AND m.judul LIKE ?
          OR COALESCE(m.deskripsi, '') LIKE ?
          OR COALESCE(m.file_name, '') LIKE ?

        ORDER BY m.created_at DESC

        LIMIT 10
        `,
        [session.id_user, schoolId, like, like, like],
      );

      /* =========================
         TUGAS
      ========================= */
      const [assignments] = await db.query(
        `
        SELECT
          a.id_assignment AS id,
          'Tugas' AS type,
          a.judul AS title,
          CONCAT(
            'Tugas • ',
            COALESCE(c.nama_kelas, 'Umum')
          ) AS subtitle,
          '/assignments' AS href

        FROM assignments a

        LEFT JOIN classes c
          ON c.id_class = a.class_id

        INNER JOIN student_classes sc
          ON sc.class_id = a.class_id
          AND sc.student_id = ?

        WHERE
          c.school_id = ?
          AND a.judul LIKE ?
          OR COALESCE(a.deskripsi, '') LIKE ?

        ORDER BY a.deadline ASC

        LIMIT 10
        `,
        [session.id_user, schoolId, like, like],
      );

      /* =========================
         PENGUMUMAN
      ========================= */
      const [announcements] = await db.query(
        `
        SELECT
          id_announcement AS id,
          'Pengumuman' AS type,
          judul AS title,
          'Pengumuman sekolah' AS subtitle,
          '/announcements' AS href

        FROM announcements

        WHERE
          school_id = ?
          AND judul LIKE ?
          OR COALESCE(isi, '') LIKE ?

        ORDER BY created_at DESC

        LIMIT 10
        `,
        [schoolId, like, like],
      );

      results = [...materials, ...assignments, ...announcements];
    }

    /* =====================================================
       URUTKAN HASIL
    ===================================================== */

    results.sort((a, b) =>
      String(a.title).localeCompare(String(b.title), "id"),
    );

    return NextResponse.json({
      data: results.slice(0, 15),
    });
  } catch (error) {
    console.error("=================================");
    console.error("UNIVERSAL SEARCH ERROR");
    console.error("MESSAGE:", error?.message);
    console.error("CODE:", error?.code);
    console.error("SQL MESSAGE:", error?.sqlMessage);
    console.error("SQL:", error?.sql);
    console.error("=================================");

    return NextResponse.json(
      {
        message: "Gagal melakukan pencarian",
        error: error?.message || String(error),
        code: error?.code || null,
        sqlMessage: error?.sqlMessage || null,
      },
      { status: 500 },
    );
  }
}

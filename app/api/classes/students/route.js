import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function auth() {
  const s = await getSession();

  if (!s) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (s.role !== "admin") {
    return {
      error: NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return { session: s };
}

async function owned(teacherId, classId, schoolId) {
  const [r] = await db.query(
    `
    SELECT c.id_class
    FROM classes c
    JOIN teacher_classes tc ON tc.class_id = c.id_class
    WHERE
      tc.teacher_id = ?
      AND c.id_class = ?
      AND c.school_id = ?
    `,
    [teacherId, classId, schoolId],
  );

  return r.length > 0;
}

export async function GET(request) {
  const { error, session } = await auth();
  if (error) return error;

  try {
    const id = Number(
      new URL(request.url).searchParams.get("class_id"),
    );

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    if (!await owned(session.id_user, id, schoolId)) {
      return NextResponse.json(
        { message: "Kelas tidak ditemukan" },
        { status: 404 },
      );
    }

    const [students] = await db.query(
      `
      SELECT
        u.id_user,
        u.username,
        u.email,
        u.nama_lengkap
      FROM student_classes sc
      JOIN users u ON u.id_user = sc.student_id
      WHERE sc.class_id = ?
      ORDER BY u.nama_lengkap
      `,
      [id],
    );

    // Satu akun siswa boleh digunakan di beberapa sekolah,
    // tetapi hanya satu kelas aktif dalam satu sekolah.
    const [available] = await db.query(
      `
      SELECT
        u.id_user,
        u.username,
        u.nama_lengkap
      FROM users u
      WHERE
        u.role = 'user'
        AND NOT EXISTS (
          SELECT 1
          FROM student_classes sc2
          JOIN classes c2 ON c2.id_class = sc2.class_id
          WHERE
            sc2.student_id = u.id_user
            AND c2.school_id = ?
        )
      ORDER BY u.nama_lengkap
      `,
      [schoolId],
    );

    return NextResponse.json({
      students,
      available,
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Gagal mengambil siswa",
        error: e.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const { error, session } = await auth();
  if (error) return error;

  try {
    const b = await request.json();

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    const class_id = Number(b.class_id);
    const student_id = Number(b.student_id);

    if (!class_id || !student_id) {
      return NextResponse.json(
        { message: "Kelas dan siswa wajib dipilih" },
        { status: 400 },
      );
    }

    if (!await owned(session.id_user, class_id, schoolId)) {
      return NextResponse.json(
        { message: "Kelas tidak ditemukan" },
        { status: 404 },
      );
    }

    const [u] = await db.query(
      `
      SELECT id_user
      FROM users
      WHERE
        id_user = ?
        AND role = 'user'
      `,
      [student_id],
    );

    if (!u.length) {
      return NextResponse.json(
        { message: "Siswa tidak ditemukan" },
        { status: 404 },
      );
    }

    // Cegah satu siswa mempunyai dua kelas pada sekolah
    // yang sama, tetapi tetap boleh mempunyai kelas di
    // sekolah lain.
    const [existing] = await db.query(
      `
      SELECT
        c.nama_kelas
      FROM student_classes sc
      JOIN classes c ON c.id_class = sc.class_id
      WHERE
        sc.student_id = ?
        AND c.school_id = ?
      LIMIT 1
      `,
      [student_id, schoolId],
    );

    if (existing.length) {
      return NextResponse.json(
        {
          message:
            `Siswa sudah terdaftar di kelas ${existing[0].nama_kelas} pada sekolah ini. ` +
            "Satu siswa hanya dapat memiliki satu kelas per sekolah.",
        },
        { status: 409 },
      );
    }

    await db.query(
      `
      INSERT INTO student_classes (student_id, class_id)
      VALUES (?, ?)
      `,
      [student_id, class_id],
    );

    return NextResponse.json({
      message: "Siswa berhasil ditambahkan ke kelas",
    });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "Siswa sudah terdaftar di kelas ini" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal menambahkan siswa",
        error: e.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  const { error, session } = await auth();
  if (error) return error;

  try {
    const q = new URL(request.url).searchParams;

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    const class_id = Number(q.get("class_id"));
    const student_id = Number(q.get("student_id"));

    if (!await owned(session.id_user, class_id, schoolId)) {
      return NextResponse.json(
        { message: "Kelas tidak ditemukan" },
        { status: 404 },
      );
    }

    await db.query(
      `
      DELETE FROM student_classes
      WHERE class_id = ? AND student_id = ?
      `,
      [class_id, student_id],
    );

    return NextResponse.json({
      message: "Siswa dikeluarkan dari kelas",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Gagal menghapus siswa",
        error: e.message,
      },
      { status: 500 },
    );
  }
}

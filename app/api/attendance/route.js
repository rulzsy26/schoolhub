import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function adminOnly() {
  const session = await getSession();
  if (!session)
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  if (session.role !== "admin")
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  return { session };
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

export async function GET(request) {
  const { error, session } = await adminOnly();
  if (error) return error;

  try {
    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
    const { searchParams } = new URL(request.url);
    const classId = Number(searchParams.get("class_id") || 0);
    const date =
      searchParams.get("date") || new Date().toISOString().slice(0, 10);

    if (!validDate(date)) {
      return NextResponse.json(
        { message: "Tanggal tidak valid" },
        { status: 400 },
      );
    }

    const [classes] = await db.query(
      `
      SELECT c.id_class, c.nama_kelas, c.tingkat,
             (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id=c.id_class) AS jumlah_siswa
      FROM classes c
      INNER JOIN teacher_classes tc ON tc.class_id=c.id_class AND tc.teacher_id=?
      WHERE c.school_id=?
      ORDER BY c.tingkat DESC, c.nama_kelas ASC
    `,
      [session.id_user, schoolId],
    );

    if (!classId) return NextResponse.json({ classes, data: [], date });

    const [owned] = await db.query(
      "SELECT c.id_class FROM classes c JOIN teacher_classes tc ON tc.class_id=c.id_class WHERE tc.teacher_id=? AND c.id_class=? AND c.school_id=?",
      [session.id_user, classId, schoolId],
    );
    if (!owned.length)
      return NextResponse.json(
        { message: "Kelas tidak ditemukan" },
        { status: 404 },
      );

    const [students] = await db.query(
      `
      SELECT u.id_user AS student_id, u.nama_lengkap,
             COALESCE(a.status, 'alpa') AS status,
             COALESCE(a.catatan, '') AS catatan
      FROM student_classes sc
      INNER JOIN users u ON u.id_user=sc.student_id
      LEFT JOIN attendance a
        ON a.student_id=sc.student_id AND a.class_id=sc.class_id AND a.tanggal=?
      WHERE sc.class_id=? AND u.role='user'
      ORDER BY u.nama_lengkap ASC
    `,
      [date, classId],
    );

    return NextResponse.json({
      classes,
      data: students,
      date,
      class_id: classId,
    });
  } catch (e) {
    return NextResponse.json(
      { message: "Gagal mengambil absensi", error: e.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const { error, session } = await adminOnly();
  if (error) return error;

  try {
    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
    const body = await request.json();
    const classId = Number(body.class_id);
    const date = String(body.date || "");
    const records = Array.isArray(body.records) ? body.records : [];

    if (!classId || !validDate(date) || !records.length) {
      return NextResponse.json(
        { message: "Kelas, tanggal, dan data absensi wajib diisi" },
        { status: 400 },
      );
    }

    const [owned] = await db.query(
      "SELECT c.id_class FROM classes c JOIN teacher_classes tc ON tc.class_id=c.id_class WHERE tc.teacher_id=? AND c.id_class=? AND c.school_id=?",
      [session.id_user, classId, schoolId],
    );

    if (!owned.length) {
      return NextResponse.json(
        { message: "Kelas tidak ditemukan" },
        { status: 404 },
      );
    }

    const allowed = new Set(["hadir", "izin", "sakit", "alpa"]);

    for (const item of records) {
      const studentId = Number(item.student_id);
      const status = String(item.status || "alpa");
      const catatan = String(item.catatan || "").trim();

      if (!studentId || !allowed.has(status)) continue;

      const [member] = await db.query(
        "SELECT 1 FROM student_classes WHERE student_id=? AND class_id=?",
        [studentId, classId],
      );

      if (!member.length) continue;

      await db.query(
        `
        INSERT INTO attendance
          (class_id, student_id, tanggal, status, catatan)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status=VALUES(status),
          catatan=VALUES(catatan),
          updated_at=CURRENT_TIMESTAMP
        `,
        [classId, studentId, date, status, catatan || null],
      );
    }

    return NextResponse.json({
      message: "Absensi berhasil disimpan",
    });
  } catch (e) {
    console.error("ATTENDANCE POST ERROR:", e);

    return NextResponse.json(
      { message: e.message || "Gagal menyimpan absensi" },
      { status: 500 },
    );
  }
}

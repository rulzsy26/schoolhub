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

export async function GET(request) {
  const { error, session } = await adminOnly();
  if (error) return error;
  try {
    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );
    const [rows] = await db.query(
      `
      SELECT c.id_class, c.nama_kelas, c.tingkat, c.wali_kelas,
             u.nama_lengkap AS wali_nama,
             (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id=c.id_class) AS jumlah_siswa
      FROM classes c
      LEFT JOIN users u ON u.id_user=c.wali_kelas
      INNER JOIN teacher_classes tc ON tc.class_id=c.id_class AND tc.teacher_id=?
      WHERE c.school_id=?
      ORDER BY c.tingkat DESC, c.nama_kelas ASC
    `,
      [session.id_user, schoolId],
    );
    return NextResponse.json({ data: rows });
  } catch (e) {
    return NextResponse.json(
      { message: "Gagal mengambil kelas", error: e.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const { error, session } = await adminOnly();
  if (error) return error;
  try {
    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );
    const body = await request.json();
    const nama_kelas = String(body.nama_kelas || "").trim();
    const tingkat = String(body.tingkat || "").trim();
    if (!nama_kelas || !tingkat)
      return NextResponse.json(
        { message: "Nama kelas dan tingkat wajib diisi" },
        { status: 400 },
      );

    const [result] = await db.query(
      "INSERT INTO classes (school_id, nama_kelas, tingkat, wali_kelas) VALUES (?, ?, ?, ?)",
      [schoolId, nama_kelas, tingkat, session.id_user],
    );
    await db.query(
      "INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)",
      [session.id_user, result.insertId],
    );
    return NextResponse.json(
      { message: "Kelas berhasil ditambahkan", id_class: result.insertId },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Gagal menambahkan kelas", error: e.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );
    const id_class = Number(body.id_class);
    const nama_kelas = String(body.nama_kelas || "").trim();
    const tingkat = String(body.tingkat || "").trim();

    if (!id_class || !nama_kelas || !tingkat) {
      return NextResponse.json(
        {
          message: "ID kelas, nama kelas, dan tingkat wajib diisi.",
        },
        { status: 400 },
      );
    }

    const [result] = await db.query(
      `
      UPDATE classes
      SET
        nama_kelas = ?,
        tingkat = ?
      WHERE id_class = ? AND school_id = ?
      `,
      [nama_kelas, tingkat, id_class, schoolId],
    );

    return NextResponse.json({
      message: "Kelas berhasil diperbarui.",
    });
  } catch (error) {
    console.error("=================================");
    console.error("UPDATE CLASS ERROR");
    console.error("MESSAGE:", error?.message);
    console.error("CODE:", error?.code);
    console.error("SQL MESSAGE:", error?.sqlMessage);
    console.error("SQL:", error?.sql);
    console.error("=================================");

    return NextResponse.json(
      {
        message:
          error?.sqlMessage || error?.message || "Gagal memperbarui kelas.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  const { error, session } = await adminOnly();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { message: "ID kelas tidak valid" },
        { status: 400 },
      );
    }

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    // Pastikan kelas memang milik guru/admin
    // dan berada di sekolah yang sedang aktif.
    const [owned] = await db.query(
      `
      SELECT c.id_class
      FROM classes c
      INNER JOIN teacher_classes tc
        ON tc.class_id = c.id_class
      WHERE c.id_class = ?
        AND c.school_id = ?
        AND tc.teacher_id = ?
      LIMIT 1
      `,
      [id, schoolId, session.id_user],
    );

    if (!owned.length) {
      return NextResponse.json(
        { message: "Kelas tidak ditemukan atau bukan kelas yang kamu ampu." },
        { status: 404 },
      );
    }

    // Hapus relasi siswa dari kelas
    await db.query("DELETE FROM student_classes WHERE class_id = ?", [id]);

    // Hapus relasi guru dengan kelas
    await db.query("DELETE FROM teacher_classes WHERE class_id = ?", [id]);

    // Hapus kelas.
    // Tabel lain yang menggunakan class_id dan memiliki
    // ON DELETE CASCADE akan ikut dibersihkan oleh MySQL.
    await db.query("DELETE FROM classes WHERE id_class = ? AND school_id = ?", [
      id,
      schoolId,
    ]);

    return NextResponse.json({
      message: "Kelas berhasil dihapus",
    });
  } catch (e) {
    console.error("DELETE CLASS ERROR:", e);

    return NextResponse.json(
      {
        message: e?.sqlMessage || e?.message || "Gagal menghapus kelas",
        error: e?.code || null,
      },
      { status: 500 },
    );
  }
}

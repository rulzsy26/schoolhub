import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  const schoolId = Number(
    request.cookies.get("schoolhub_school_id")?.value || 1,
  );

  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const materialId = Number(new URL(request.url).searchParams.get("id"));

    // =========================
    // DETAIL SATU MATERI
    // =========================
    if (materialId) {
      const [rows] =
        session.role === "admin"
          ? await db.query(
              `
              SELECT
                m.id_material,
                m.teacher_id,
                m.class_id,
                m.judul,
                m.deskripsi,
                m.file_name,
                m.file_type,
                m.file_url,
                m.created_at,
                c.nama_kelas,
                u.nama_lengkap AS guru
              FROM materials m
              JOIN classes c
                ON c.id_class = m.class_id
              JOIN users u
                ON u.id_user = m.teacher_id
              JOIN teacher_classes tc
                ON tc.class_id = c.id_class
               AND tc.teacher_id = ?
              WHERE m.id_material = ?
                AND c.school_id = ?
              LIMIT 1
              `,
              [session.id_user, materialId, schoolId],
            )
          : await db.query(
              `
              SELECT
                m.id_material,
                m.teacher_id,
                m.class_id,
                m.judul,
                m.deskripsi,
                m.file_name,
                m.file_type,
                m.file_url,
                m.created_at,
                c.nama_kelas,
                u.nama_lengkap AS guru
              FROM materials m
              JOIN classes c
                ON c.id_class = m.class_id
              JOIN student_classes sc
                ON sc.class_id = m.class_id
               AND sc.student_id = ?
              JOIN users u
                ON u.id_user = m.teacher_id
              WHERE m.id_material = ?
                AND c.school_id = ?
              LIMIT 1
              `,
              [session.id_user, materialId, schoolId],
            );

      if (!rows.length) {
        return NextResponse.json(
          {
            message: "Materi tidak ditemukan",
            data: null,
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        data: rows[0],
        role: session.role,
      });
    }

    // =========================
    // LIST SEMUA MATERI
    // =========================
    const [rows] =
      session.role === "admin"
        ? await db.query(
            `
            SELECT
              m.*,
              c.nama_kelas
            FROM materials m
            JOIN classes c
              ON c.id_class = m.class_id
            JOIN teacher_classes tc
              ON tc.class_id = c.id_class
             AND tc.teacher_id = ?
            WHERE c.school_id = ?
            ORDER BY m.created_at DESC
            `,
            [session.id_user, schoolId],
          )
        : await db.query(
            `
            SELECT
              m.*,
              c.nama_kelas,
              u.nama_lengkap AS guru
            FROM materials m
            JOIN classes c
              ON c.id_class = m.class_id
            JOIN student_classes sc
              ON sc.class_id = m.class_id
             AND sc.student_id = ?
            JOIN users u
              ON u.id_user = m.teacher_id
            WHERE c.school_id = ?
            ORDER BY m.created_at DESC
            `,
            [session.id_user, schoolId],
          );

    return NextResponse.json({
      data: rows,
      role: session.role,
    });
  } catch (e) {
    console.error("GET /api/materials ERROR:", e);

    return NextResponse.json(
      {
        message: "Gagal mengambil materi",
        error: e?.message || String(e),
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let file_url = null;

  try {
    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    const body = await request.json();

    const judul = String(body.judul || "").trim();
    const deskripsi = String(body.deskripsi || "").trim();
    const class_id = Number(body.class_id);

    file_url = body.file_url ? String(body.file_url) : null;

    const file_name = body.file_name ? String(body.file_name) : null;

    const file_type = body.file_type ? String(body.file_type) : null;

    if (!judul || !class_id) {
      return NextResponse.json(
        { message: "Judul dan kelas wajib diisi" },
        { status: 400 },
      );
    }

    const [owned] = await db.query(
      `
      SELECT c.id_class
      FROM classes c
      JOIN teacher_classes tc
        ON tc.class_id = c.id_class
      WHERE tc.teacher_id = ?
        AND c.id_class = ?
        AND c.school_id = ?
      `,
      [session.id_user, class_id, schoolId],
    );

    if (!owned.length) {
      return NextResponse.json(
        { message: "Kelas bukan kelas yang kamu ampu" },
        { status: 403 },
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO materials
      (
        teacher_id,
        class_id,
        judul,
        deskripsi,
        file_name,
        file_type,
        file_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        session.id_user,
        class_id,
        judul,
        deskripsi,
        file_name,
        file_type,
        file_url,
      ],
    );

    return NextResponse.json(
      {
        message: "Materi berhasil ditambahkan",
        id_material: result.insertId,
        file_url,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("POST /api/materials ERROR:", e);

    // Kalau DB gagal setelah file berhasil diupload,
    // hapus file Blob supaya tidak menjadi file yatim.
    if (file_url && file_url.includes(".public.blob.vercel-storage.com")) {
      try {
        await del(file_url);
      } catch (blobError) {
        console.error("Gagal membersihkan Blob:", blobError);
      }
    }

    return NextResponse.json(
      {
        message: "Gagal menambahkan materi",
        error: e?.message || String(e),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const id = Number(new URL(request.url).searchParams.get("id"));

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    const [rows] = await db.query(
      `
      SELECT m.file_url
      FROM materials m
      JOIN classes c
        ON c.id_class = m.class_id
      JOIN teacher_classes tc
        ON tc.class_id = m.class_id
       AND tc.teacher_id = ?
      WHERE m.id_material = ?
        AND c.school_id = ?
      `,
      [session.id_user, id, schoolId],
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    // =========================
    // HAPUS FILE DARI VERCEL BLOB
    // =========================
    if (rows[0].file_url) {
      try {
        await del(rows[0].file_url);
      } catch (blobError) {
        console.error("Gagal menghapus file Blob:", blobError);
      }
    }

    // =========================
    // HAPUS DATA MYSQL
    // =========================
    await db.query("DELETE FROM materials WHERE id_material = ?", [id]);

    return NextResponse.json({
      message: "Materi berhasil dihapus",
    });
  } catch (e) {
    console.error("DELETE /api/materials ERROR:", e);

    return NextResponse.json(
      {
        message: "Gagal menghapus materi",
        error: e?.message || String(e),
      },
      { status: 500 },
    );
  }
}

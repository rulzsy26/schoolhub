import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const materialId = Number(id);

    if (!materialId) {
      return NextResponse.json(
        { message: "ID materi tidak valid" },
        { status: 400 },
      );
    }

    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    const [rows] = await db.query(
      `
      SELECT
        m.id_material,
        m.judul,
        m.deskripsi,
        m.file_name,
        m.file_type,
        m.file_url,
        c.nama_kelas
      FROM materials m
      JOIN classes c
        ON c.id_class = m.class_id
      WHERE m.id_material = ?
        AND c.school_id = ?
      LIMIT 1
      `,
      [materialId, schoolId],
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Materi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: rows[0],
    });
  } catch (error) {
    console.error("GET MATERIAL BY ID ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil materi",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

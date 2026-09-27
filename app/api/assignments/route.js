import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { del } from "@vercel/blob";

/* =========================
   GET
========================= */
export async function GET(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    // =========================
    // GURU / ADMIN
    // =========================
    if (session.role === "admin") {
      const [rows] = await db.query(
        `
        SELECT
          a.id_assignment,
          a.teacher_id,
          a.class_id,
          a.judul,
          a.deskripsi,
          a.file_name,
          a.file_type,
          a.file_url,
          a.deadline,
          a.created_at,

          c.nama_kelas,

          (
            SELECT COUNT(*)
            FROM submissions s
            WHERE s.assignment_id = a.id_assignment
          ) AS terkumpul,

          (
            SELECT COUNT(*)
            FROM student_classes sc
            WHERE sc.class_id = a.class_id
          ) AS total_siswa

        FROM assignments a

        JOIN classes c
          ON c.id_class = a.class_id

        WHERE a.teacher_id = ?
          AND c.school_id = ?

        ORDER BY a.deadline ASC
        `,
        [session.id_user, schoolId],
      );

      return NextResponse.json({
        data: rows,
        role: "admin",
      });
    }

    // =========================
    // SISWA
    // =========================
    const [rows] = await db.query(
      `
      SELECT
        a.id_assignment,
        a.teacher_id,
        a.class_id,
        a.judul,
        a.deskripsi,

        -- FILE DARI GURU
        a.file_name AS assignment_file_name,
        a.file_type AS assignment_file_type,
        a.file_url AS assignment_file_url,

        a.deadline,
        a.created_at,

        c.nama_kelas,
        u.nama_lengkap AS guru,

        -- FILE PENGUMPULAN SISWA
        s.id_submission,
        s.file_name AS submission_file_name,
        s.file_url AS submission_file_url,
        s.catatan,
        s.submitted_at,
        s.status,

        g.nilai,
        g.feedback,
        g.graded_at

      FROM assignments a

      JOIN classes c
        ON c.id_class = a.class_id

      JOIN student_classes sc
        ON sc.class_id = a.class_id
        AND sc.student_id = ?

      JOIN users u
        ON u.id_user = a.teacher_id

      LEFT JOIN submissions s
        ON s.assignment_id = a.id_assignment
        AND s.student_id = ?

      LEFT JOIN grades g
        ON g.id_grade = (
          SELECT g2.id_grade
          FROM grades g2
          WHERE g2.submission_id = s.id_submission
          ORDER BY g2.graded_at DESC
          LIMIT 1
        )

      WHERE c.school_id = ?

      ORDER BY a.deadline ASC
      `,
      [session.id_user, session.id_user, schoolId],
    );

    return NextResponse.json({
      data: rows,
      role: "user",
    });
  } catch (e) {
    console.error("GET ASSIGNMENTS ERROR:", e);

    return NextResponse.json(
      {
        message: "Gagal mengambil tugas",
        error: e.message,
      },
      { status: 500 },
    );
  }
}

/* =========================
   POST
========================= */
export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // =====================================================
  // SISWA - KUMPULKAN TUGAS
  // =====================================================

  if (session.role === "user") {
    let uploadedFileUrl = null;

    try {
      const schoolId = Number(
        request.cookies.get("schoolhub_school_id")?.value || 1,
      );

      const body = await request.json();

      const action = String(body.action || "");

      if (action !== "submit") {
        return NextResponse.json(
          {
            message: "Action tidak valid",
          },
          { status: 400 },
        );
      }

      const assignment_id = Number(body.assignment_id);

      const file_name = String(body.file_name || "").trim();

      const file_type = String(body.file_type || "")
        .trim()
        .toUpperCase();

      const file_url = String(body.file_url || "").trim();

      const catatan = String(body.catatan || "").trim();

      uploadedFileUrl = file_url;

      if (!assignment_id || !file_name || !file_url) {
        return NextResponse.json(
          {
            message: "Assignment dan file tugas wajib diisi",
          },
          { status: 400 },
        );
      }

      // Pastikan URL benar-benar berasal dari Vercel Blob
      if (!file_url.includes(".public.blob.vercel-storage.com")) {
        return NextResponse.json(
          {
            message: "URL file tidak valid",
          },
          { status: 400 },
        );
      }

      // =================================================
      // CEK TUGAS + CEK SISWA MEMANG ADA DI KELAS
      // =================================================

      const [assignmentRows] = await db.query(
        `
        SELECT
          a.id_assignment,
          a.class_id,
          a.deadline
        FROM assignments a

        JOIN classes c
          ON c.id_class = a.class_id

        JOIN student_classes sc
          ON sc.class_id = a.class_id
         AND sc.student_id = ?

        WHERE a.id_assignment = ?
          AND c.school_id = ?

        LIMIT 1
        `,
        [session.id_user, assignment_id, schoolId],
      );

      if (!assignmentRows.length) {
        return NextResponse.json(
          {
            message: "Tugas tidak ditemukan atau bukan tugas untuk kelas kamu",
          },
          { status: 404 },
        );
      }

      const assignment = assignmentRows[0];

      // =================================================
      // TENTUKAN STATUS
      // =================================================

      const deadline = new Date(assignment.deadline);

      const status = new Date() > deadline ? "late" : "submitted";

      // =================================================
      // CEK SUBMISSION LAMA
      // =================================================

      const [existingRows] = await db.query(
        `
        SELECT
          id_submission,
          file_url,
          status
        FROM submissions

        WHERE assignment_id = ?
          AND student_id = ?

        LIMIT 1
        `,
        [assignment_id, session.id_user],
      );

      // =================================================
      // UPDATE SUBMISSION
      // =================================================

      if (existingRows.length) {
        const oldFileUrl = existingRows[0].file_url;

        await db.query(
          `
          UPDATE submissions

          SET
            file_name = ?,
            file_url = ?,
            catatan = ?,
            submitted_at = NOW(),
            status = ?

          WHERE id_submission = ?
          `,
          [file_name, file_url, catatan, status, existingRows[0].id_submission],
        );

        // Hapus file lama dari Blob
        if (
          oldFileUrl &&
          oldFileUrl !== file_url &&
          oldFileUrl.includes(".public.blob.vercel-storage.com")
        ) {
          try {
            await del(oldFileUrl);
          } catch (blobError) {
            console.error("Gagal menghapus Blob lama:", blobError);
          }
        }

        return NextResponse.json({
          message:
            status === "late"
              ? "Tugas berhasil dikumpulkan, tetapi terlambat"
              : "Tugas berhasil dikumpulkan ulang",
          status,
        });
      }

      // =================================================
      // INSERT SUBMISSION BARU
      // =================================================

      const [result] = await db.query(
        `
        INSERT INTO submissions
        (
          assignment_id,
          student_id,
          file_name,
          file_url,
          catatan,
          submitted_at,
          status
        )

        VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `,
        [assignment_id, session.id_user, file_name, file_url, catatan, status],
      );

      return NextResponse.json(
        {
          message:
            status === "late"
              ? "Tugas berhasil dikumpulkan, tetapi terlambat"
              : "Tugas berhasil dikumpulkan",
          id_submission: result.insertId,
          status,
        },
        { status: 201 },
      );
    } catch (e) {
      console.error("SUBMIT ASSIGNMENT ERROR:", e);

      // Kalau DB gagal setelah upload Blob,
      // hapus Blob agar tidak menjadi file yatim.
      if (
        uploadedFileUrl &&
        uploadedFileUrl.includes(".public.blob.vercel-storage.com")
      ) {
        try {
          await del(uploadedFileUrl);
        } catch (blobError) {
          console.error("Gagal menghapus Blob:", blobError);
        }
      }

      return NextResponse.json(
        {
          message: "Gagal mengumpulkan tugas",
          error: e?.message || String(e),
        },
        { status: 500 },
      );
    }
  }

  // =====================================================
  // GURU / ADMIN - BUAT ASSIGNMENT
  // =====================================================

  if (session.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let uploadedFileUrl = null;

  try {
    const schoolId = Number(
      request.cookies.get("schoolhub_school_id")?.value || 1,
    );

    const body = await request.json();

    const judul = String(body.judul || "").trim();
    const deskripsi = String(body.deskripsi || "").trim();
    const class_id = Number(body.class_id);
    const deadline = String(body.deadline || "").trim();

    const file_name = body.file_name ? String(body.file_name) : null;

    const file_type = body.file_type
      ? String(body.file_type).toUpperCase()
      : null;

    const file_url = body.file_url ? String(body.file_url) : null;

    uploadedFileUrl = file_url;

    if (!judul || !class_id || !deadline) {
      return NextResponse.json(
        {
          message: "Judul, kelas, dan deadline wajib diisi",
        },
        { status: 400 },
      );
    }

    // Pastikan kelas memang kelas yang diajar guru
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
        {
          message: "Kelas bukan kelas yang kamu ampu",
        },
        { status: 403 },
      );
    }

    // Jika ada file, pastikan URL berasal dari Vercel Blob
    if (file_url && !file_url.includes(".public.blob.vercel-storage.com")) {
      return NextResponse.json(
        {
          message: "URL lampiran tidak valid",
        },
        { status: 400 },
      );
    }

    const [r] = await db.query(
      `
      INSERT INTO assignments
      (
        teacher_id,
        class_id,
        judul,
        deskripsi,
        file_name,
        file_type,
        file_url,
        deadline
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        session.id_user,
        class_id,
        judul,
        deskripsi,
        file_name,
        file_type,
        file_url,
        deadline,
      ],
    );

    return NextResponse.json(
      {
        message: "Tugas berhasil dibuat",
        id_assignment: r.insertId,
        file_url,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("CREATE ASSIGNMENT ERROR:", e);

    // Kalau DB gagal setelah file berhasil diupload,
    // hapus file Blob agar tidak menjadi file yatim.
    if (
      uploadedFileUrl &&
      uploadedFileUrl.includes(".public.blob.vercel-storage.com")
    ) {
      try {
        await del(uploadedFileUrl);
      } catch (blobError) {
        console.error("Gagal menghapus Blob:", blobError);
      }
    }

    return NextResponse.json(
      {
        message: "Gagal membuat tugas",
        error: e?.message || String(e),
      },
      { status: 500 },
    );
  }
}

/* =========================
   DELETE
========================= */
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

    const [r] = await db.query(
      `
      SELECT
  a.id_assignment,
  a.file_url
      FROM assignments a
      JOIN classes c
        ON c.id_class = a.class_id
      WHERE a.id_assignment = ?
        AND a.teacher_id = ?
        AND c.school_id = ?
      `,
      [id, session.id_user, schoolId],
    );

    if (!r.length) {
      return NextResponse.json(
        {
          message: "Tugas tidak ditemukan",
        },
        { status: 404 },
      );
    }

    if (
      r[0]?.file_url &&
      r[0].file_url.includes(".public.blob.vercel-storage.com")
    ) {
      try {
        await del(r[0].file_url);
      } catch (blobError) {
        console.error("Gagal menghapus file Blob:", blobError);
      }
    }

    await db.query("DELETE FROM assignments WHERE id_assignment = ?", [id]);

    return NextResponse.json({
      message: "Tugas berhasil dihapus",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Gagal menghapus tugas",
        error: e.message,
      },
      { status: 500 },
    );
  }
}

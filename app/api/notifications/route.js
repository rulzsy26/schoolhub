import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const schoolId = Number(request.cookies.get('schoolhub_school_id')?.value || 1);
  if (![1, 2].includes(schoolId)) {
    return NextResponse.json({ message: 'School context tidak valid', data: [] }, { status: 400 });
  }

  try {
    let rows;

    if (session.role === 'admin') {
      // Guru hanya menerima aktivitas dari sekolah yang sedang aktif.
      const [result] = await db.query(`
        SELECT * FROM (
          SELECT
            m.id_material AS id,
            'material' AS type,
            'Materi baru' AS title,
            CONCAT(m.judul, ' • ', c.nama_kelas) AS message,
            m.created_at,
            '/materials' AS href
          FROM materials m
          INNER JOIN classes c ON c.id_class = m.class_id
          INNER JOIN teacher_classes tc ON tc.class_id = c.id_class
            AND tc.teacher_id = ?
          WHERE m.teacher_id = ?
            AND c.school_id = ?
            AND m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

          UNION ALL

          SELECT
            a.id_assignment AS id,
            'assignment' AS type,
            'Tugas baru' AS title,
            CONCAT(a.judul, ' • ', c.nama_kelas) AS message,
            a.created_at,
            '/assignments' AS href
          FROM assignments a
          INNER JOIN classes c ON c.id_class = a.class_id
          WHERE a.teacher_id = ?
            AND c.school_id = ?
            AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

          UNION ALL

          SELECT
            ac.id_event AS id,
            'calendar' AS type,
            'Agenda baru' AS title,
            CONCAT(ac.judul, ' • ', DATE_FORMAT(ac.tanggal_mulai, '%d %b %Y')) AS message,
            ac.created_at,
            '/calendar' AS href
          FROM academic_calendar ac
          WHERE ac.school_id = ?
            AND ac.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

          UNION ALL

          SELECT
            an.id_announcement AS id,
            'announcement' AS type,
            'Pengumuman baru' AS title,
            an.judul AS message,
            an.created_at,
            '/announcements' AS href
          FROM announcements an
          WHERE an.school_id = ?
            AND an.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) notifications
        ORDER BY created_at DESC
        LIMIT 20
      `, [session.id_user, session.id_user, schoolId, session.id_user, schoolId, schoolId, schoolId]);
      rows = result;
    } else {
      // Siswa hanya menerima materi/tugas dari kelas yang sedang diikutinya,
      // sedangkan agenda dan pengumuman berasal dari sekolah aktif.
      const [result] = await db.query(`
        SELECT * FROM (
          SELECT
            m.id_material AS id,
            'material' AS type,
            'Materi baru' AS title,
            CONCAT(m.judul, ' • ', c.nama_kelas) AS message,
            m.created_at,
            '/materials' AS href
          FROM materials m
          INNER JOIN classes c ON c.id_class = m.class_id
          INNER JOIN student_classes sc ON sc.class_id = c.id_class
            AND sc.student_id = ?
          WHERE c.school_id = ?
            AND m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

          UNION ALL

          SELECT
            a.id_assignment AS id,
            'assignment' AS type,
            'Tugas baru' AS title,
            CONCAT(a.judul, ' • ', c.nama_kelas) AS message,
            a.created_at,
            '/assignments' AS href
          FROM assignments a
          INNER JOIN classes c ON c.id_class = a.class_id
          INNER JOIN student_classes sc ON sc.class_id = c.id_class
            AND sc.student_id = ?
          WHERE c.school_id = ?
            AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

          UNION ALL

          SELECT
            ac.id_event AS id,
            'calendar' AS type,
            'Agenda baru' AS title,
            CONCAT(ac.judul, ' • ', DATE_FORMAT(ac.tanggal_mulai, '%d %b %Y')) AS message,
            ac.created_at,
            '/calendar' AS href
          FROM academic_calendar ac
          WHERE ac.school_id = ?
            AND ac.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)

          UNION ALL

          SELECT
            an.id_announcement AS id,
            'announcement' AS type,
            'Pengumuman baru' AS title,
            an.judul AS message,
            an.created_at,
            '/announcements' AS href
          FROM announcements an
          WHERE an.school_id = ?
            AND an.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) notifications
        ORDER BY created_at DESC
        LIMIT 20
      `, [session.id_user, schoolId, session.id_user, schoolId, schoolId, schoolId]);
      rows = result;
    }

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('NOTIFICATIONS API ERROR:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil notifikasi', data: [] },
      { status: 500 }
    );
  }
}

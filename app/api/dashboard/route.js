import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const schoolId = Number(request.cookies.get('schoolhub_school_id')?.value || 1);

  try {
    const studentJoin = session.role === 'user'
      ? 'JOIN student_classes sc ON sc.class_id=c.id_class AND sc.student_id=?'
      : '';
    const schoolParams = session.role === 'user' ? [session.id_user, schoolId] : [schoolId];

    const [assignments] = await db.query(`
      SELECT COUNT(*) total
      FROM assignments a
      JOIN classes c ON c.id_class=a.class_id
      ${studentJoin}
      WHERE c.school_id=? AND a.deadline >= NOW()
    `, schoolParams);

    const [announcements] = await db.query(`
      SELECT COUNT(*) total FROM announcements
      WHERE school_id=? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, [schoolId]);

    const materialJoin = session.role === 'user'
      ? 'JOIN student_classes sc ON sc.class_id=c.id_class AND sc.student_id=?'
      : '';
    const materialParams = session.role === 'user' ? [session.id_user, schoolId] : [schoolId];

    const [materials] = await db.query(`
      SELECT COUNT(*) total
      FROM materials m
      JOIN classes c ON c.id_class=m.class_id
      ${materialJoin}
      WHERE c.school_id=? AND m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, materialParams);

    return NextResponse.json({
      role: session.role,
      school_id: schoolId,
      stats: {
        assignments: assignments[0]?.total || 0,
        announcements: announcements[0]?.total || 0,
        materials: materials[0]?.total || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal mengambil dashboard', error: error.message },
      { status: 500 },
    );
  }
}

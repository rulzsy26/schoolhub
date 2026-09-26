import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function adminOnly() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  if (session.role !== 'admin') return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  return { session };
}

export async function GET(request) {
  const { error, session } = await adminOnly();
  if (error) return error;
  try {
    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
    const [rows] = await db.query(`SELECT s.*, c.nama_kelas FROM schedules s JOIN classes c ON c.id_class=s.class_id JOIN teacher_classes tc ON tc.class_id=c.id_class AND tc.teacher_id=? WHERE c.school_id=? ORDER BY FIELD(s.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), s.jam_mulai`, [session.id_user, schoolId]);
    return NextResponse.json({ data: rows });
  } catch (e) { return NextResponse.json({ message: 'Gagal mengambil jadwal', error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { error, session } = await adminOnly();
  if (error) return error;
  try {
    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
    const body = await request.json();
    const class_id = Number(body.class_id);
    const hari = String(body.hari || '').trim();
    const jam_mulai = String(body.jam_mulai || '').trim();
    const jam_selesai = String(body.jam_selesai || '').trim();
    const mata_pelajaran = String(body.mata_pelajaran || '').trim();
    const ruang = String(body.ruang || '').trim();
    if (!class_id || !hari || !jam_mulai || !jam_selesai || !mata_pelajaran) return NextResponse.json({ message: 'Data jadwal belum lengkap' }, { status: 400 });
    const [owned] = await db.query('SELECT c.id_class FROM classes c JOIN teacher_classes tc ON tc.class_id=c.id_class WHERE tc.teacher_id=? AND c.id_class=? AND c.school_id=?', [session.id_user,class_id,schoolId]);
    if (!owned.length) return NextResponse.json({ message: 'Kelas bukan kelas yang kamu ampu' }, { status: 403 });
    const [result] = await db.query('INSERT INTO schedules (teacher_id,class_id,hari,jam_mulai,jam_selesai,mata_pelajaran,ruang) VALUES (?,?,?,?,?,?,?)', [session.id_user,class_id,hari,jam_mulai,jam_selesai,mata_pelajaran,ruang]);
    return NextResponse.json({ message: 'Jadwal berhasil ditambahkan', id_schedule: result.insertId }, { status: 201 });
  } catch (e) { return NextResponse.json({ message: 'Gagal menambahkan jadwal', error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { error, session } = await adminOnly();
  if (error) return error;
  try {
    const schoolId = Number(request.cookies.get("schoolhub_school_id")?.value || 1);
    const id = Number(new URL(request.url).searchParams.get('id'));
    const [rows] = await db.query('SELECT s.id_schedule FROM schedules s JOIN classes c ON c.id_class=s.class_id WHERE s.id_schedule=? AND s.teacher_id=? AND c.school_id=?', [id,session.id_user,schoolId]);
    if (!rows.length) return NextResponse.json({ message: 'Jadwal tidak ditemukan' }, { status: 404 });
    await db.query('DELETE FROM schedules WHERE id_schedule=?', [id]);
    return NextResponse.json({ message: 'Jadwal berhasil dihapus' });
  } catch (e) { return NextResponse.json({ message: 'Gagal menghapus jadwal', error: e.message }, { status: 500 }); }
}

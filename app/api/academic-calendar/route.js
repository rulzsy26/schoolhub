import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  return { session };
}

async function requireAdmin() {
  const result = await requireSession();
  if (result.error) return result;
  if (result.session.role !== 'admin') {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return result;
}

export async function GET(request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const schoolId = Number(request.cookies.get('schoolhub_school_id')?.value || 1);
    const [rows] = await db.query(`
      SELECT
        id_event,
        judul,
        deskripsi,
        jenis,
        tanggal_mulai,
        tanggal_selesai,
        created_at
      FROM academic_calendar
      WHERE school_id=?
      ORDER BY tanggal_mulai ASC, id_event ASC
    `, [schoolId]);

    return NextResponse.json({ data: rows });
  } catch (e) {
    return NextResponse.json(
      { message: 'Gagal mengambil kalender akademik', error: e.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const schoolId = Number(request.cookies.get('schoolhub_school_id')?.value || 1);
    const body = await request.json();
    const judul = String(body.judul || '').trim();
    const deskripsi = String(body.deskripsi || '').trim();
    const jenis = String(body.jenis || 'Kegiatan').trim();
    const tanggal_mulai = String(body.tanggal_mulai || '').trim();
    const tanggal_selesai = String(body.tanggal_selesai || tanggal_mulai).trim();

    if (!judul || !tanggal_mulai) {
      return NextResponse.json(
        { message: 'Judul dan tanggal mulai wajib diisi' },
        { status: 400 }
      );
    }

    if (tanggal_selesai < tanggal_mulai) {
      return NextResponse.json(
        { message: 'Tanggal selesai tidak boleh sebelum tanggal mulai' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO academic_calendar
        (school_id, judul, deskripsi, jenis, tanggal_mulai, tanggal_selesai, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [schoolId, judul, deskripsi || null, jenis, tanggal_mulai, tanggal_selesai, session.id_user]
    );

    return NextResponse.json(
      { message: 'Agenda akademik berhasil ditambahkan', id_event: result.insertId },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Gagal menambahkan agenda akademik', error: e.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const schoolId = Number(request.cookies.get('schoolhub_school_id')?.value || 1);
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ message: 'ID agenda tidak valid' }, { status: 400 });
    }

    const [result] = await db.query(
      'DELETE FROM academic_calendar WHERE id_event=? AND school_id=?',
      [id, schoolId]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ message: 'Agenda tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Agenda akademik berhasil dihapus' });
  } catch (e) {
    return NextResponse.json(
      { message: 'Gagal menghapus agenda akademik', error: e.message },
      { status: 500 }
    );
  }
}

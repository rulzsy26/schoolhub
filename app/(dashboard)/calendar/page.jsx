'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Modal, Field, Select, FormActions, Notice } from '@/components/admin/Modal';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const TYPE_STYLES = {
  'Ujian': 'bg-red-50 text-red-600 border-red-100',
  'Libur': 'bg-orange-50 text-orange-600 border-orange-100',
  'Kegiatan': 'bg-blue-50 text-blue-600 border-blue-100',
  'Rapat': 'bg-purple-50 text-purple-600 border-purple-100',
  'Pembelajaran': 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

function dateKey(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(`${dateKey(value)}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isInRange(day, start, end) {
  const current = day.getTime();
  return current >= start.getTime() && current <= end.getTime();
}

export default function CalendarPage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [calendarRes, meRes] = await Promise.all([
        fetch('/api/academic-calendar'),
        fetch('/api/auth/me'),
      ]);
      const calendarData = await calendarRes.json();
      const meData = await meRes.json();

      if (!calendarRes.ok) throw new Error(calendarData.message || 'Gagal mengambil kalender');
      setRows(calendarData.data || []);
      setSession(meData.user || meData.data || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isAdmin = session?.role === 'admin';

  const calendarCells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const total = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    return Array.from({ length: total }, (_, index) => {
      const dayNumber = index - firstDay + 1;
      if (dayNumber < 1) {
        return new Date(year, month - 1, previousMonthDays + dayNumber);
      }
      if (dayNumber > daysInMonth) {
        return new Date(year, month + 1, dayNumber - daysInMonth);
      }
      return new Date(year, month, dayNumber);
    });
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = {};

    rows.forEach((event) => {
      const start = new Date(`${dateKey(event.tanggal_mulai)}T00:00:00`);
      const end = new Date(`${dateKey(event.tanggal_selesai || event.tanggal_mulai)}T00:00:00`);
      const safeEnd = end < start ? start : end;

      for (let d = new Date(start); d <= safeEnd; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!map[key]) map[key] = [];
        map[key].push(event);
      }
    });

    return map;
  }, [rows]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');

    try {
      const fd = new FormData(e.currentTarget);
      const body = Object.fromEntries(fd.entries());
      const response = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Gagal menyimpan agenda');

      setOpen(false);
      setNotice(data.message);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Hapus agenda akademik ini?')) return;

    const response = await fetch(`/api/academic-calendar?id=${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Gagal menghapus agenda');
      return;
    }

    setNotice(data.message);
    load();
  };

  const monthEvents = rows.filter((event) => {
    const start = new Date(`${dateKey(event.tanggal_mulai)}T00:00:00`);
    const end = new Date(`${dateKey(event.tanggal_selesai || event.tanggal_mulai)}T00:00:00`);
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  const todayKey = dateKey(new Date().toISOString());

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kalender Akademik"
        subtitle="Informasi ujian, libur, kegiatan, rapat, dan agenda penting sekolah."
        button={isAdmin ? 'Tambah Agenda' : undefined}
        onClick={() => {
          setError('');
          setNotice('');
          setOpen(true);
        }}
      />

      <Notice text={notice} />
      <Notice text={error} error />

      <div className="rounded-2xl border border-[#DFEAF7] bg-white p-4 shadow-soft sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#102A72]">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <p className="text-sm text-[#7185AF]">
              {monthEvents.length} agenda pada bulan ini
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-xl border border-[#D9E6F5] px-3 py-2 text-sm font-bold text-[#486398] hover:bg-[#F6F9FD]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
              }}
              className="rounded-xl border border-[#D9E6F5] px-4 py-2 text-sm font-bold text-[#486398] hover:bg-[#F6F9FD]"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-xl border border-[#D9E6F5] px-3 py-2 text-sm font-bold text-[#486398] hover:bg-[#F6F9FD]"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-[#E4EDF7]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="border-b border-r border-[#E4EDF7] bg-[#F8FBFF] p-2 text-center text-xs font-bold uppercase text-[#7185AF] last:border-r-0 sm:p-3">
              {day}
            </div>
          ))}

          {calendarCells.map((day, index) => {
            const key = dateKey(day.toISOString());
            const isCurrentMonth = day.getMonth() === cursor.getMonth();
            const isToday = key === todayKey;
            const events = eventsByDay[key] || [];

            return (
              <div
                key={`${key}-${index}`}
                className={`min-h-[105px] border-b border-r border-[#E4EDF7] p-1.5 last:border-r-0 sm:min-h-[125px] sm:p-2 ${isCurrentMonth ? 'bg-white' : 'bg-[#FAFCFF]'}`}
              >
                <div className={`mb-1 grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-[#36548E]' : 'text-[#B6C3D8]'}`}>
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={`${event.id_event}-${key}`}
                      title={`${event.judul} — ${event.deskripsi || ''}`}
                      className={`rounded-md border px-1.5 py-1 text-[10px] font-bold leading-tight sm:text-xs ${TYPE_STYLES[event.jenis] || 'border-blue-100 bg-blue-50 text-blue-600'}`}
                    >
                      {event.judul}
                    </div>
                  ))}

                  {events.length > 3 && (
                    <div className="px-1 text-[10px] font-semibold text-[#7185AF]">
                      +{events.length - 3} agenda
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#DFEAF7] bg-white p-4 shadow-soft sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#102A72]">Agenda Bulan Ini</h2>
            <p className="text-sm text-[#7185AF]">Daftar kegiatan akademik sekolah.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-[#7185AF]">Memuat kalender...</div>
        ) : !monthEvents.length ? (
          <div className="rounded-xl bg-[#F8FBFF] px-4 py-8 text-center text-sm text-[#7185AF]">
            Belum ada agenda akademik pada bulan ini.
          </div>
        ) : (
          <div className="space-y-2">
            {monthEvents.map((event) => (
              <div key={event.id_event} className="flex flex-col gap-3 rounded-xl border border-[#E5EDF7] p-3 sm:flex-row sm:items-center">
                <div className={`w-fit rounded-lg border px-3 py-2 text-xs font-bold ${TYPE_STYLES[event.jenis] || 'border-blue-100 bg-blue-50 text-blue-600'}`}>
                  {event.jenis}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#102A72]">{event.judul}</div>
                  <div className="text-xs text-[#7185AF]">
                    {formatDate(event.tanggal_mulai)}
                    {dateKey(event.tanggal_selesai) !== dateKey(event.tanggal_mulai) && ` — ${formatDate(event.tanggal_selesai)}`}
                  </div>
                  {event.deskripsi && <p className="mt-1 text-sm text-[#6176A8]">{event.deskripsi}</p>}
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => remove(event.id_event)}
                    className="w-fit rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <Modal open={open} onClose={() => setOpen(false)} title="Tambah Agenda Akademik">
          <form onSubmit={save} className="space-y-4">
            <Field label="Nama Agenda" name="judul" placeholder="Contoh: Ujian Tengah Semester" required />

            <Select label="Jenis Agenda" name="jenis" defaultValue="Kegiatan" required>
              <option>Ujian</option>
              <option>Libur</option>
              <option>Kegiatan</option>
              <option>Rapat</option>
              <option>Pembelajaran</option>
            </Select>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tanggal Mulai" name="tanggal_mulai" type="date" required />
              <Field label="Tanggal Selesai" name="tanggal_selesai" type="date" />
            </div>

            <Field label="Keterangan" name="deskripsi" placeholder="Keterangan agenda (opsional)" />

            <FormActions
              onCancel={() => setOpen(false)}
              submit={saving ? 'Menyimpan...' : 'Tambah Agenda'}
              loading={saving}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

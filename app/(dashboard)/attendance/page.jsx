"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader, Notice } from "@/components/admin/Modal";

const statuses = [
  ["hadir", "Hadir"],
  ["izin", "Izin"],
  ["sakit", "Sakit"],
  ["alpa", "Alpa"],
];

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadClasses = async () => {
    const r = await fetch("/api/attendance");
    const d = await r.json();
    if (!r.ok) {
      return setError(d.message || d.error || "Gagal menyimpan absensi");
    }
    setClasses(d.classes || []);
  };

  const loadStudents = async () => {
    if (!classId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/attendance?class_id=${classId}&date=${date}`);
      const d = await r.json();
      if (!r.ok) throw Error(d.message || "Gagal mengambil data absensi");
      setStudents(d.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date]);

  const stats = useMemo(
    () =>
      statuses.reduce((acc, [key]) => {
        acc[key] = students.filter((s) => s.status === key).length;
        return acc;
      }, {}),
    [students],
  );

  const updateStatus = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status } : s)),
    );
  };

  const updateNote = (studentId, catatan) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, catatan } : s)),
    );
  };

  const setAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const save = async () => {
    if (!classId || !students.length) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const r = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: Number(classId),
          date,
          records: students.map((s) => ({
            student_id: s.student_id,
            status: s.status,
            catatan: s.catatan,
          })),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.message || "Gagal menyimpan absensi");
      setNotice(d.message);
      await loadStudents();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Absensi Siswa"
        subtitle="Catat kehadiran siswa berdasarkan kelas dan tanggal."
      />
      <Notice text={notice} />
      <Notice text={error} error />

      <div className="grid gap-4 rounded-2xl border border-[#DFEAF7] bg-white p-5 shadow-soft md:grid-cols-[1fr_220px_auto] md:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#102A72]">
            Kelas
          </span>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full rounded-xl border border-[#D8E5F5] bg-white px-4 py-3 text-sm text-[#102A72] outline-none focus:border-blue-500"
          >
            <option value="">Pilih kelas</option>
            {classes.map((c) => (
              <option key={c.id_class} value={c.id_class}>
                {c.nama_kelas}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[#102A72]">
            Tanggal
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[#D8E5F5] bg-white px-4 py-3 text-sm text-[#102A72] outline-none focus:border-blue-500"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={!classId || !students.length || saving}
          style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
          className="rounded-xl px-5 py-3 text-sm font-bold shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Absensi"}
        </button>
      </div>

      {classId && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statuses.map(([key, label]) => (
              <div
                key={key}
                className="rounded-2xl border border-[#DFEAF7] bg-white p-4 shadow-soft"
              >
                <div className="text-xs font-bold text-[#7185AF]">{label}</div>
                <div className="mt-1 text-2xl font-extrabold text-[#102A72]">
                  {stats[key] || 0}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#DFEAF7] bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-[#E8EFF7] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold text-[#102A72]">
                  Daftar Kehadiran
                </h2>
                <p className="mt-1 text-sm text-[#7185AF]">
                  Atur status setiap siswa, lalu simpan.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAll(key)}
                    className="rounded-lg bg-[#F2F6FB] px-3 py-2 text-xs font-bold text-[#486398] hover:bg-[#E7F1FF]"
                  >
                    Semua {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-[#E8EFF7] text-xs uppercase text-[#7185AF]">
                    <th className="px-5 py-4">No</th>
                    <th>Nama Siswa</th>
                    <th>Status</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-10 text-center text-sm text-[#7185AF]"
                      >
                        Memuat...
                      </td>
                    </tr>
                  ) : (
                    students.map((student, index) => (
                      <tr
                        key={student.student_id}
                        className="border-b border-[#F0F4F8] last:border-0"
                      >
                        <td className="px-5 py-4 text-sm text-[#7185AF]">
                          {index + 1}
                        </td>
                        <td className="font-bold text-[#102A72]">
                          {student.nama_lengkap}
                        </td>
                        <td>
                          <select
                            value={student.status}
                            onChange={(e) =>
                              updateStatus(student.student_id, e.target.value)
                            }
                            className="rounded-lg border border-[#D8E5F5] bg-white px-3 py-2 text-xs font-bold text-[#102A72]"
                          >
                            {statuses.map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="pr-5">
                          <input
                            value={student.catatan || ""}
                            onChange={(e) =>
                              updateNote(student.student_id, e.target.value)
                            }
                            placeholder="Opsional"
                            className="w-full rounded-lg border border-[#D8E5F5] px-3 py-2 text-xs text-[#102A72] outline-none focus:border-blue-500"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                  {!loading && !students.length && (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-10 text-center text-sm text-[#7185AF]"
                      >
                        Belum ada siswa di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import {
  PageHeader,
  Modal,
  Field,
  Select,
  FormActions,
  Notice,
} from "@/components/admin/Modal";

export default function ClassesPage() {
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [open, setOpen] = useState(false),
    [edit, setEdit] = useState(null),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [studentsOpen, setStudentsOpen] = useState(false),
    [selectedClass, setSelectedClass] = useState(null),
    [students, setStudents] = useState([]),
    [available, setAvailable] = useState([]),
    [studentId, setStudentId] = useState("");

  const [studentNotice, setStudentNotice] = useState("");
  const load = () => {
    setLoading(true);
    fetch("/api/classes")
      .then((r) => r.json())
      .then((d) => {
        if (!d.data) throw Error(d.message);
        setRows(d.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const save = async (e) => {
    e.preventDefault();
    setNotice("");
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      nama_kelas: fd.get("nama_kelas"),
      tingkat: fd.get("tingkat"),
    };
    const res = await fetch("/api/classes", {
      method: edit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit ? { ...body, id_class: edit.id_class } : body),
    });
    const d = await res.json();
    if (!res.ok) return setError(d.message || "Gagal menyimpan");
    setOpen(false);
    setEdit(null);
    setNotice(d.message);
    load();
  };
  const showStudents = async (row) => {
    setSelectedClass(row);
    setStudentsOpen(true);
    setError("");
    const r = await fetch(`/api/classes/students?class_id=${row.id_class}`);
    const d = await r.json();
    if (!r.ok) return setError(d.message);
    setStudents(d.students || []);
    setAvailable(d.available || []);
  };
  const addStudent = async (e) => {
    e.preventDefault();

    if (!studentId) {
      setStudentNotice("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    setStudentNotice("");

    const r = await fetch("/api/classes/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        class_id: selectedClass.id_class,
        student_id: Number(studentId),
      }),
    });

    const d = await r.json();

    if (!r.ok) {
      setStudentNotice(
        d.message || "Siswa tidak dapat ditambahkan ke kelas ini.",
      );
      return;
    }

    setStudentNotice("Siswa berhasil ditambahkan ke kelas.");
    setStudentId("");

    await showStudents(selectedClass);
    load();

    setTimeout(() => {
      setStudentNotice("");
    }, 3000);
  };
  const removeStudent = async (id) => {
    if (!confirm("Keluarkan siswa dari kelas?")) return;
    const r = await fetch(
      `/api/classes/students?class_id=${selectedClass.id_class}&student_id=${id}`,
      { method: "DELETE" },
    );
    const d = await r.json();
    if (!r.ok) return setError(d.message);
    showStudents(selectedClass);
    load();
  };
  const del = async (id) => {
    if (
      !confirm(
        "Hapus kelas ini? Data yang bergantung pada kelas juga dapat ikut terhapus.",
      )
    )
      return;
    const r = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) return setError(d.message);
    setNotice(d.message);
    load();
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="My Classes"
        subtitle="Kelola kelas yang kamu ampu."
        button="Tambah Kelas"
        onClick={() => {
          setEdit(null);
          setError("");
          setOpen(true);
        }}
      />
      <Notice text={notice} />
      <Notice text={error} error />
      <div className="overflow-hidden rounded-2xl border border-[#DFEAF7] bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-[#E8EFF7] text-xs uppercase text-[#7185AF]">
                <th className="px-5 py-4">Kelas</th>
                <th>Tingkat</th>
                <th>Jumlah Siswa</th>
                <th>Wali Kelas</th>
                <th className="text-right px-5">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-sm text-[#7185AF]"
                  >
                    Memuat...
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id_class}
                    className="border-b border-[#F0F4F8] last:border-0"
                  >
                    <td className="px-5 py-4 font-bold text-[#102A72]">
                      {r.nama_kelas}
                    </td>
                    <td className="py-4 text-sm text-[#6176A8]">
                      Kelas {r.tingkat}
                    </td>
                    <td className="py-4 text-sm text-[#6176A8]">
                      {r.jumlah_siswa} siswa
                    </td>
                    <td className="py-4 text-sm text-[#6176A8]">
                      {r.wali_nama || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => showStudents(r)}
                        className="mr-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                      >
                        Siswa
                      </button>
                      <button
                        onClick={() => {
                          setEdit(r);
                          setOpen(true);
                        }}
                        className="mr-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(r.id_class)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !rows.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-sm text-[#7185AF]"
                  >
                    Belum ada kelas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Edit Kelas" : "Tambah Kelas"}
      >
        <form onSubmit={save} className="space-y-4">
          <Field
            label="Nama Kelas"
            name="nama_kelas"
            defaultValue={edit?.nama_kelas || ""}
            placeholder="Contoh: 9A"
            required
          />
          <Select
            label="Tingkat"
            name="tingkat"
            defaultValue={edit?.tingkat || "9"}
          >
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </Select>
          <FormActions
            onCancel={() => setOpen(false)}
            submit={edit ? "Simpan Perubahan" : "Tambah Kelas"}
          />
        </form>
      </Modal>

      <Modal
        open={studentsOpen}
        onClose={() => setStudentsOpen(false)}
        title={`Siswa Kelas ${selectedClass?.nama_kelas || ""}`}
        wide
      >
        <div className="space-y-4">
          <form
            onSubmit={addStudent}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="flex-1 rounded-xl border border-[#D9E6F5] px-3 py-3 text-sm"
            >
              <option value="">Pilih siswa untuk ditambahkan</option>
              {available.map((s) => (
                <option key={s.id_user} value={s.id_user}>
                  {s.nama_lengkap} — {s.username}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
              }}
            >
              Tambah Siswa
            </button>
          </form>
          {studentNotice && (
            <div
              className="rounded-xl border px-4 py-3 text-sm font-semibold"
              style={{
                backgroundColor: studentNotice.includes("berhasil")
                  ? "#ECFDF5"
                  : "#FEF2F2",
                borderColor: studentNotice.includes("berhasil")
                  ? "#A7F3D0"
                  : "#FECACA",
                color: studentNotice.includes("berhasil")
                  ? "#047857"
                  : "#B91C1C",
              }}
            >
              {studentNotice}
            </div>
          )}

          <div className="space-y-2"></div>
          <div className="space-y-2">
            {students.map((s) => (
              <div
                key={s.id_user}
                className="flex items-center gap-3 rounded-xl border border-[#E5EDF7] p-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600">
                  👤
                </div>
                <div className="min-w-0 flex-1">
                  <b className="text-sm text-[#102A72]">{s.nama_lengkap}</b>
                  <div className="text-xs text-[#7185AF]">{s.email}</div>
                </div>
                <button
                  onClick={() => removeStudent(s.id_user)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                >
                  Keluarkan
                </button>
              </div>
            ))}
            {!students.length && (
              <div className="py-8 text-center text-sm text-[#7185AF]">
                Belum ada siswa di kelas ini.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

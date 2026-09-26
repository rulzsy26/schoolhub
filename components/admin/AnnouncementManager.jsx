"use client";
import { useEffect, useState } from "react";
import { Modal, Field, Textarea, FormActions } from "./Modal";
export default function AnnouncementManager({ initial = [] }) {
  const [rows, setRows] = useState(initial),
    [open, setOpen] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const load = () =>
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setRows(d.data || []))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setError(d.message);
    setOpen(false);
    load();
  };
  const del = async (id) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    const r = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!r.ok) return setError(d.message);
    load();
  };
  return (
    <div className="rounded-2xl border border-[#DFEAF7] bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#102A72]">
            Pengumuman Terbaru
          </h2>
          <p className="text-xs text-[#7185AF]">
            Buat dan kelola pengumuman untuk siswa.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-blue px-3 py-2 text-xs font-bold text-white"
        >
          ＋ Buat Pengumuman
        </button>
      </div>
      {error && (
        <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {rows.slice(0, 5).map((r) => (
          <div
            key={r.id_announcement}
            className="flex gap-3 rounded-xl border border-[#E8EFF7] p-3"
          >
            <div className="min-w-0 flex-1">
              <b className="text-sm text-[#102A72]">{r.judul}</b>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7185AF]">
                {r.isi}
              </p>
              <span className="mt-1 block text-[11px] text-[#8A9BC0]">
                {new Date(r.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
            <button
              onClick={() => del(r.id_announcement)}
              className="self-start rounded-lg bg-red-50 px-2 py-1.5 text-xs font-bold text-red-600"
            >
              Hapus
            </button>
          </div>
        ))}
        {!rows.length && (
          <div className="py-8 text-center text-sm text-[#7185AF]">
            Belum ada pengumuman.
          </div>
        )}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Buat Pengumuman">
        <form onSubmit={save} className="space-y-4">
          <Field
            label="Judul"
            name="judul"
            placeholder="Contoh: Jadwal Ujian Tengah Semester"
            required
          />
          <Textarea
            label="Isi Pengumuman"
            name="isi"
            placeholder="Tulis informasi yang ingin disampaikan..."
            required
          />
          <FormActions
            onCancel={() => setOpen(false)}
            submit="Publikasikan"
            loading={loading}
          />
        </form>
      </Modal>
    </div>
  );
}

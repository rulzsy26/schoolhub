"use client";
import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  PageHeader,
  Modal,
  Field,
  Select,
  Textarea,
  FormActions,
  Notice,
} from "@/components/admin/Modal";
export default function MaterialsPage() {
  const [rows, setRows] = useState([]),
    [classes, setClasses] = useState([]),
    [role, setRole] = useState(""),
    [open, setOpen] = useState(false),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const load = () => {
    setLoading(true);
    fetch("/api/materials")
      .then((r) => r.json())
      .then((d) => {
        if (!d.data) throw Error(d.message);
        setRows(d.data);
        setRole(d.role || "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const openUploadModal = async () => {
    setOpen(true);

    try {
      const r = await fetch("/api/classes");
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.message || "Gagal mengambil daftar kelas");
      }

      setClasses(d.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setSaving(true);
    setUploadProgress(0);
    setError("");
    setNotice("");

    const form = e.currentTarget;

    try {
      const judul = String(form.judul?.value || "").trim();
      const deskripsi = String(form.deskripsi?.value || "").trim();
      const class_id = Number(form.class_id?.value);

      const fileInput = form.file;
      const file = fileInput?.files?.[0] || null;

      if (!judul || !class_id) {
        throw new Error("Judul dan kelas wajib diisi");
      }

      let file_url = null;
      let file_name = null;
      let file_type = null;

      // ==========================================
      // 1. UPLOAD FILE LANGSUNG KE VERCEL BLOB
      // ==========================================
      if (file) {
        setNotice("Mengupload file...");
        setUploadProgress(1);

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const pathname = `materials/${Date.now()}-${safeName}`;

        const blob = await upload(pathname, file, {
          access: "public",

          handleUploadUrl: "/api/materials/upload",

          multipart: true,

          onUploadProgress: ({ percentage }) => {
            setUploadProgress(Math.round(percentage));
          },
        });

        file_url = blob.url;
        file_name = file.name;

        const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";

        file_type = extension;

        setUploadProgress(100);
        setNotice("File berhasil diupload. Menyimpan materi...");
      }

      // ==========================================
      // 2. SIMPAN METADATA KE MYSQL
      // ==========================================
      const r = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          deskripsi,
          class_id,
          file_url,
          file_name,
          file_type,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error
            ? `${d.message}: ${d.error}`
            : d.message || "Gagal menambahkan materi",
        );
      }

      setOpen(false);
      setNotice(d.message);
      setUploadProgress(0);

      await load();
    } catch (e) {
      console.error("SAVE MATERIAL ERROR:", e);

      setError(e?.message || "Gagal menambahkan materi");

      setUploadProgress(0);
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Hapus materi ini?")) return;
    const r = await fetch(`/api/materials?id=${id}`, { method: "DELETE" }),
      d = await r.json();
    if (!r.ok) return setError(d.message);
    setNotice(d.message);
    load();
  };
  return (
    <div className="space-y-5">
      <PageHeader
        title="Learning Materials"
        subtitle={
          role === "admin"
            ? "Kelola materi pembelajaran."
            : "Akses materi pembelajaran dari guru."
        }
        button={role === "admin" ? "Upload Materi" : null}
        onClick={openUploadModal}
      />
      <Notice text={notice} />
      <Notice text={error} error />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center">Memuat...</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.id_material}
              className="rounded-2xl border border-[#DFEAF7] bg-white p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-sm font-extrabold text-blue-600">
                  {r.file_type || "FILE"}
                </div>
                <span className="rounded-full bg-[#F2F6FB] px-2.5 py-1 text-xs font-bold text-[#6176A8]">
                  {r.nama_kelas}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[#102A72]">
                {r.judul}
              </h3>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-[#7185AF]">
                {r.deskripsi || "Tanpa deskripsi"}
              </p>
              {r.guru && (
                <div className="mt-3 text-xs text-[#6176A8]">
                  Guru: <b>{r.guru}</b>
                </div>
              )}
              <div className="mt-1 text-xs text-[#7185AF]">
                {new Date(r.created_at).toLocaleDateString("id-ID")}
                {r.file_name ? ` • ${r.file_name}` : ""}
              </div>
              <div className="mt-4 flex gap-2">
                {r.file_url && (
                  <button
                    onClick={() => {
                      const type = String(r.file_type || "").toLowerCase();
                      const schoolSlug =
                        window.location.pathname.split("/")[2] ||
                        "smp-negeri-3-jakarta";

                      if (type === "ppt" || type === "pptx") {
                        window.location.href = `/school/${schoolSlug}/materials/view/${r.id_material}`;
                      } else {
                        window.open(r.file_url, "_blank");
                      }
                    }}
                    className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600"
                  >
                    Buka Materi
                  </button>
                )}

                {role === "admin" && (
                  <button
                    onClick={() => del(r.id_material)}
                    className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {!loading && !rows.length && (
          <div className="col-span-full rounded-2xl border border-[#DFEAF7] bg-white p-10 text-center text-sm text-[#7185AF]">
            Belum ada materi.
          </div>
        )}
      </div>
      {role === "admin" && (
        <Modal open={open} onClose={() => setOpen(false)} title="Upload Materi">
          <form onSubmit={save} className="space-y-4">
            <Field label="Judul Materi" name="judul" required />
            <Select label="Kelas" name="class_id" required>
              <option value="">Pilih kelas</option>
              {classes.map((c) => (
                <option key={c.id_class} value={c.id_class}>
                  {c.nama_kelas}
                </option>
              ))}
            </Select>
            <Textarea label="Deskripsi" name="deskripsi" />
            <Field
              label="File"
              name="file"
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mp4,.webm,.png,.jpg,.jpeg"
            />
            {saving && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Progress upload</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <FormActions
              onCancel={() => setOpen(false)}
              submit={saving ? "Mengupload..." : "Upload Materi"}
              loading={saving}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

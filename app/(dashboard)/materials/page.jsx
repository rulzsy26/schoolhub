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
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submittingRef = useRef(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  // file = upload file biasa
  // canva = presentasi dari Canva
  const [materialType, setMaterialType] = useState("file");

  const load = () => {
    setLoading(true);

    fetch("/api/materials")
      .then((r) => r.json())
      .then((d) => {
        if (!d.data) throw Error(d.message || "Gagal mengambil materi.");

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
    setMaterialType("file");
    setUploadProgress(0);
    setError("");
    setNotice("");

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

  const closeUploadModal = () => {
    if (saving) return;

    setOpen(false);
    setMaterialType("file");
    setUploadProgress(0);
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
      const jenis_materi = String(
        form.jenis_materi?.value || "file",
      ).toLowerCase();

      const fileInput = form.file;
      const file = fileInput?.files?.[0] || null;

      const canva_url = String(form.canva_url?.value || "").trim();

      if (!judul || !class_id) {
        throw new Error("Judul dan kelas wajib diisi.");
      }

      let file_url = null;
      let file_name = null;
      let file_type = null;

      // =====================================================
      // MODE 1: PRESENTASI CANVA
      // =====================================================
      if (jenis_materi === "canva") {
        if (!canva_url) {
          throw new Error("Link Canva wajib diisi.");
        }

        let parsedUrl;

        try {
          parsedUrl = new URL(canva_url);
        } catch {
          throw new Error("Link Canva tidak valid.");
        }

        const hostname = parsedUrl.hostname.toLowerCase();

        if (hostname !== "canva.com" && !hostname.endsWith(".canva.com")) {
          throw new Error("Link harus berasal dari Canva (canva.com).");
        }

        setNotice("Menyimpan presentasi Canva...");

        const r = await fetch("/api/materials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul,
            deskripsi,
            class_id,
            file_url: null,
            file_name: null,
            file_type: null,
            canva_url,
          }),
        });

        const d = await r.json();

        if (!r.ok) {
          throw new Error(
            d.error
              ? `${d.message}: ${d.error}`
              : d.message || "Gagal menambahkan materi Canva.",
          );
        }

        setOpen(false);
        setNotice(d.message || "Presentasi Canva berhasil ditambahkan.");
        setUploadProgress(0);

        await load();

        return;
      }

      // =====================================================
      // MODE 2: UPLOAD FILE
      // =====================================================

      if (!file) {
        throw new Error("File materi wajib dipilih.");
      }

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

      // =====================================================
      // SIMPAN METADATA FILE KE MYSQL
      // =====================================================

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
          canva_url: null,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error
            ? `${d.message}: ${d.error}`
            : d.message || "Gagal menambahkan materi.",
        );
      }

      setOpen(false);
      setNotice(d.message || "Materi berhasil ditambahkan.");
      setUploadProgress(0);

      await load();
    } catch (e) {
      console.error("SAVE MATERIAL ERROR:", e);

      setError(e?.message || "Gagal menambahkan materi.");

      setUploadProgress(0);
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Hapus materi ini?")) return;

    const r = await fetch(`/api/materials?id=${id}`, {
      method: "DELETE",
    });

    const d = await r.json();

    if (!r.ok) {
      return setError(d.message);
    }

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

      {/* =====================================================
          DAFTAR MATERI
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center">Memuat...</div>
        ) : (
          rows.map((r) => {
            const isCanva = Boolean(r.canva_url);

            return (
              <div
                key={r.id_material}
                className="rounded-2xl border border-[#DFEAF7] bg-white p-5 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xs font-extrabold text-blue-600">
                    {isCanva ? "CANVA" : r.file_type || "FILE"}
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

                  {isCanva
                    ? " • Presentasi Canva"
                    : r.file_name
                      ? ` • ${r.file_name}`
                      : ""}
                </div>

                <div className="mt-4 flex gap-2">
                  {/* =================================================
                      BUKA MATERI
                  ================================================= */}
                  {(r.file_url || r.canva_url) && (
                    <button
                      type="button"
                      onClick={() => {
                        const schoolSlug =
                          window.location.pathname.split("/")[2] ||
                          "smp-negeri-3-jakarta";

                        // Canva selalu menggunakan halaman viewer
                        if (r.canva_url) {
                          window.location.href = `/school/${schoolSlug}/materials/view/${r.id_material}`;
                          return;
                        }

                        const type = String(r.file_type || "").toLowerCase();

                        // PPT/PPTX menggunakan Material Viewer
                        if (type === "ppt" || type === "pptx") {
                          window.location.href = `/school/${schoolSlug}/materials/view/${r.id_material}`;
                          return;
                        }

                        // File biasa langsung dibuka
                        if (r.file_url) {
                          window.open(
                            r.file_url,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                      }}
                      className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                    >
                      Buka Materi
                    </button>
                  )}

                  {/* =================================================
                      HAPUS
                  ================================================= */}
                  {role === "admin" && (
                    <button
                      type="button"
                      onClick={() => del(r.id_material)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {!loading && !rows.length && (
          <div className="col-span-full rounded-2xl border border-[#DFEAF7] bg-white p-10 text-center text-sm text-[#7185AF]">
            Belum ada materi.
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL TAMBAH MATERI
      ===================================================== */}
      {role === "admin" && (
        <Modal open={open} onClose={closeUploadModal} title="Tambah Materi">
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

            {/* =================================================
                JENIS MATERI
            ================================================= */}
            <Select
              label="Jenis Materi"
              name="jenis_materi"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              required
            >
              <option value="file">Upload File</option>

              <option value="canva">Presentasi Canva</option>
            </Select>

            {/* =================================================
                UPLOAD FILE
            ================================================= */}
            {materialType === "file" && (
              <>
                <Field
                  label="File Materi"
                  name="file"
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mp4,.webm,.png,.jpg,.jpeg"
                  required
                />

                <p className="text-xs leading-5 text-[#7185AF]">
                  Format yang didukung: PDF, PowerPoint, Word, Excel, video, dan
                  gambar.
                </p>
              </>
            )}

            {/* =================================================
                CANVA URL
            ================================================= */}
            {materialType === "canva" && (
              <div className="space-y-2">
                <Field
                  label="URL Presentasi Canva"
                  name="canva_url"
                  type="url"
                  placeholder="https://www.canva.com/design/..."
                  required
                />

                <div className="rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700">
                  <p className="font-bold">Cara mendapatkan link Canva:</p>

                  <p className="mt-1">
                    Buka presentasi di Canva → klik
                    <b> Bagikan / Share </b>→ salin link desain → tempelkan link
                    tersebut di sini.
                  </p>

                  <p className="mt-1">
                    Pastikan desain Canva dapat dilihat oleh siswa melalui link.
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                PROGRESS UPLOAD
            ================================================= */}
            {saving && materialType === "file" && uploadProgress > 0 && (
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

            {/* =================================================
                ACTION
            ================================================= */}
            <FormActions
              onCancel={closeUploadModal}
              submit={
                saving
                  ? materialType === "canva"
                    ? "Menyimpan..."
                    : "Mengupload..."
                  : materialType === "canva"
                    ? "Simpan Presentasi"
                    : "Upload Materi"
              }
              loading={saving}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

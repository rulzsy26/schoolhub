"use client";
import OfficeViewer, { isOfficeFile } from "@/components/OfficeViewer";
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

export default function Assignments() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submittingRef = useRef(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assignments");
      const data = await res.json();
      console.log("ASSIGNMENTS DATA:", data.data);

      if (!res.ok || !data.data) {
        throw new Error(data.message || "Gagal mengambil tugas");
      }

      setRows(data.data);
      setRole(data.role || "");

      if (data.role === "admin") {
        const classRes = await fetch("/api/classes");
        const classData = await classRes.json();

        if (classRes.ok) {
          setClasses(classData.data || []);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createAssignment = async (e) => {
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

      const class_id = Number(form.class_id?.value);

      const deskripsi = String(form.deskripsi?.value || "").trim();

      const deadline = String(form.deadline?.value || "").trim();

      const fileInput = form.file;
      const file = fileInput?.files?.[0] || null;

      if (!judul || !class_id || !deadline) {
        throw new Error("Judul, kelas, dan deadline wajib diisi");
      }

      let file_url = null;
      let file_name = null;
      let file_type = null;

      // =====================================
      // UPLOAD LAMPIRAN KE VERCEL BLOB
      // =====================================
      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          throw new Error("Ukuran file maksimal 15 MB");
        }

        setNotice("Mengupload lampiran...");
        setUploadProgress(1);

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const pathname = `assignments/${Date.now()}-${safeName}`;

        const blob = await upload(pathname, file, {
          access: "public",

          handleUploadUrl: "/api/assignments/upload",

          multipart: true,

          onUploadProgress: ({ percentage }) => {
            setUploadProgress(Math.round(percentage));
          },
        });

        file_url = blob.url;
        file_name = file.name;

        file_type = file.name.split(".").pop()?.toUpperCase() || "FILE";

        setUploadProgress(100);

        setNotice("Lampiran berhasil diupload. Menyimpan tugas...");
      }

      // =====================================
      // SIMPAN DATA TUGAS KE MYSQL
      // =====================================
      const res = await fetch("/api/assignments", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          judul,
          class_id,
          deskripsi,
          deadline: `${deadline.replace("T", " ")}:00`,

          file_name,
          file_type,
          file_url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error
            ? `${data.message}: ${data.error}`
            : data.message || "Gagal membuat tugas",
        );
      }

      setOpen(false);

      setNotice(data.message || "Tugas berhasil dibuat");

      setUploadProgress(0);

      await load();
    } catch (e) {
      console.error("CREATE ASSIGNMENT ERROR:", e);

      setError(e?.message || "Gagal membuat tugas");

      setUploadProgress(0);
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (submittingRef.current) return;
    if (!selected) return;

    submittingRef.current = true;

    setSaving(true);
    setUploadProgress(0);
    setError("");
    setNotice("");

    const form = e.currentTarget;

    try {
      const fileInput = form.file;
      const file = fileInput?.files?.[0] || null;

      const catatan = String(form.catatan?.value || "").trim();

      if (!file) {
        throw new Error("File tugas wajib dilampirkan");
      }

      if (file.size > 15 * 1024 * 1024) {
        throw new Error("Ukuran file maksimal 15 MB");
      }

      setNotice("Mengupload file tugas...");
      setUploadProgress(1);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      const pathname = `submissions/${Date.now()}-${selected.id_assignment}-${safeName}`;

      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/assignments/upload",
        multipart: true,

        onUploadProgress: ({ percentage }) => {
          setUploadProgress(Math.round(percentage));
        },
      });

      setUploadProgress(100);

      setNotice("File berhasil diupload. Menyimpan pengumpulan...");

      const r = await fetch("/api/assignments", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          action: "submit",
          assignment_id: selected.id_assignment,
          file_name: file.name,
          file_type: file.name.split(".").pop()?.toUpperCase() || "FILE",
          file_url: blob.url,
          catatan,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error
            ? `${d.message}: ${d.error}`
            : d.message || "Gagal mengumpulkan tugas",
        );
      }

      setOpen(false);
      setSelected(null);
      setNotice(d.message || "Tugas berhasil dikumpulkan");
      setUploadProgress(0);

      await load();
    } catch (e) {
      console.error("SUBMIT ASSIGNMENT ERROR:", e);

      setError(e?.message || "Gagal mengumpulkan tugas");

      setUploadProgress(0);
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (
      !confirm(
        "Hapus tugas ini? Data pengumpulan tugas siswa juga dapat ikut terhapus.",
      )
    ) {
      return;
    }

    setError("");
    setNotice("");

    const r = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
    const d = await r.json();

    if (!r.ok) return setError(d.message);

    setNotice(d.message);
    load();
  };

  if (role === "admin") {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Assignments"
          subtitle="Buat dan kelola tugas untuk kelas yang kamu ampu."
          button="Tambah Assignment"
          onClick={() => {
            setError("");
            setNotice("");
            setOpen(true);
          }}
        />

        <Notice text={notice} />
        <Notice text={error} error />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-2xl bg-white p-8 text-center">
              Memuat...
            </div>
          ) : (
            rows.map((r) => {
              const deadline = new Date(r.deadline);
              const past = deadline < new Date();

              return (
                <div
                  key={r.id_assignment}
                  className="rounded-2xl border border-[#DFEAF7] bg-white p-5 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600">
                      {r.nama_kelas}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        past
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {past ? "Deadline lewat" : "Aktif"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-extrabold text-[#102A72]">
                    {r.judul}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#7185AF]">
                    {r.deskripsi || "Tidak ada deskripsi tugas."}
                  </p>

                  <div className="mt-4 text-xs text-red-500">
                    Deadline:{" "}
                    <b>
                      {deadline.toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </b>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#F6F9FD] p-3">
                      <div className="text-xs text-[#7185AF]">Terkumpul</div>
                      <div className="mt-1 text-lg font-extrabold text-[#102A72]">
                        {Number(r.terkumpul || 0)}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#F6F9FD] p-3">
                      <div className="text-xs text-[#7185AF]">Total Siswa</div>
                      <div className="mt-1 text-lg font-extrabold text-[#102A72]">
                        {Number(r.total_siswa || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => del(r.id_assignment)}
                      style={{
                        backgroundColor: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                      }}
                      className="flex-1 rounded-xl px-4 py-2.5 text-xs font-bold hover:opacity-90"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {!loading && !rows.length && (
            <div className="col-span-full rounded-2xl border border-[#DFEAF7] bg-white p-10 text-center text-sm text-[#7185AF]">
              Belum ada assignment. Klik <b>Tambah Assignment</b> untuk membuat
              tugas baru.
            </div>
          )}
        </div>

        <Modal
          open={open}
          onClose={() => {
            if (!saving) setOpen(false);
          }}
          title="Tambah Assignment"
        >
          <form onSubmit={createAssignment} className="space-y-4">
            <Field
              label="Judul Assignment"
              name="judul"
              placeholder="Contoh: Tugas Informatika Bab 1"
              required
            />

            <Select label="Kelas" name="class_id" required>
              <option value="">Pilih kelas</option>
              {classes.map((c) => (
                <option key={c.id_class} value={c.id_class}>
                  {c.nama_kelas}
                </option>
              ))}
            </Select>

            <Textarea
              label="Deskripsi / Instruksi"
              name="deskripsi"
              placeholder="Jelaskan tugas yang harus dikerjakan siswa..."
            />

            <Field
              label="Lampiran Soal (Opsional)"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
            />

            <p className="text-xs text-[#7185AF] -mt-2">
              Opsional. Maksimal 15 MB. Format: PDF, Word, PowerPoint, Excel,
              TXT, PNG, atau JPG.
            </p>

            {saving && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6176A8]">
                  <span>Progress upload</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#EAF0F8]">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <Field
              label="Deadline"
              name="deadline"
              type="datetime-local"
              required
            />

            <FormActions
              onCancel={() => setOpen(false)}
              submit="Tambah Assignment"
              loading={saving}
            />
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assignments"
        subtitle="Lihat tugas, deadline, dan kumpulkan tugas kamu."
      />

      <Notice text={notice} />
      <Notice text={error} error />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-2xl bg-white p-8 text-center">
            Memuat...
          </div>
        ) : (
          rows.map((r) => {
            const deadline = new Date(r.deadline);
            const past = deadline < new Date();
            const graded = r.status === "graded";

            return (
              <div
                key={r.id_assignment}
                className="rounded-2xl border border-[#DFEAF7] bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600">
                    {r.nama_kelas}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      graded
                        ? "bg-purple-50 text-purple-600"
                        : r.status === "late"
                          ? "bg-red-50 text-red-600"
                          : r.status
                            ? "bg-emerald-50 text-emerald-600"
                            : past
                              ? "bg-red-50 text-red-600"
                              : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {graded
                      ? "Sudah dinilai"
                      : r.status === "late"
                        ? "Terlambat"
                        : r.status
                          ? "Sudah dikumpulkan"
                          : past
                            ? "Deadline lewat"
                            : "Belum dikumpulkan"}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-extrabold text-[#102A72]">
                  {r.judul}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#7185AF]">
                  {r.deskripsi || "Tidak ada deskripsi tugas."}
                </p>

                <div className="mt-4 text-xs text-[#6176A8]">
                  Guru: <b>{r.guru}</b>
                </div>

                <div className="mt-1 text-xs text-red-500">
                  Deadline:{" "}
                  <b>
                    {deadline.toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </b>
                </div>

                {r.nilai != null && (
                  <div className="mt-4 rounded-xl bg-purple-50 p-3">
                    <div className="text-xs text-purple-600">Nilai</div>
                    <div className="text-2xl font-extrabold text-purple-700">
                      {Number(r.nilai).toFixed(0)}
                    </div>
                    {r.feedback && (
                      <div className="mt-1 text-xs text-purple-700">
                        {r.feedback}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {r.assignment_file_url && (
                    <div className="w-full rounded-xl border border-[#DFEAF7] bg-[#F6F9FD] p-3">
                      <div className="text-xs font-semibold text-[#7185AF]">
                        Lampiran Soal
                      </div>

                      <div className="mt-1 truncate text-sm font-bold text-[#102A72]">
                        {r.assignment_file_name || "File soal"}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isOfficeFile(r.assignment_file_name)) {
                            setViewerFile({
                              url: r.assignment_file_url,
                              name: r.assignment_file_name,
                            });
                            setViewerOpen(true);
                          } else {
                            window.open(
                              r.assignment_file_url,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }
                        }}
                        className="mt-3 inline-flex rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
                      >
                        Buka File
                      </button>
                    </div>
                  )}

                  {!graded && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(r);
                        setOpen(true);
                        setError("");
                        setNotice("");
                      }}
                      className="w-full rounded-xl bg-[#102A72] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      Kumpulkan Tugas
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {!loading && !rows.length && (
          <div className="col-span-full rounded-2xl border border-[#DFEAF7] bg-white p-10 text-center text-sm text-[#7185AF]">
            Belum ada tugas untuk kelas kamu.
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Kumpulkan — ${selected?.judul || ""}`}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-[#F6F9FD] p-4 text-sm text-[#6176A8]">
            Deadline:{" "}
            <b className="text-red-500">
              {selected && new Date(selected.deadline).toLocaleString("id-ID")}
            </b>
          </div>

          <Field
            label="File Tugas"
            name="file"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png"
            required
          />

          <Textarea
            label="Catatan"
            name="catatan"
            placeholder="Tambahkan catatan untuk guru (opsional)..."
          />

          <p className="text-xs text-[#7185AF]">Ukuran maksimal 15 MB.</p>
          {saving && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#6176A8]">
                <span>Progress upload</span>
                <span>{uploadProgress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#EAF0F8]">
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
            submit="Kumpulkan Tugas"
            loading={saving}
          />
        </form>
      </Modal>
      <OfficeViewer
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setViewerFile(null);
        }}
        fileUrl={viewerFile?.url}
        fileName={viewerFile?.name}
      />
    </div>
  );
}

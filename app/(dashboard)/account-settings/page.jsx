"use client";

import { useEffect, useRef, useState } from "react";
import { Field, FormActions, Notice } from "@/components/admin/Modal";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/api/profile?me=1", {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);

        if (d.user?.foto) {
          setPreview(d.user.foto);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setNotice("");

    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih harus berupa gambar.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const save = async (e) => {
    e.preventDefault();

    setNotice("");
    setError("");
    setSaving(true);

    const fd = new FormData(e.currentTarget);

    const password = String(fd.get("password") || "");
    const passwordConfirm = String(fd.get("password_confirm") || "");

    if (password && password !== passwordConfirm) {
      setError("Konfirmasi password tidak sama.");
      setSaving(false);
      return;
    }

    const photo = fileInputRef.current?.files?.[0];

    const body = new FormData();

    body.append("email", String(fd.get("email") || "").trim());

    body.append("password", password);

    if (photo) {
      body.append("foto", photo);
    }

    try {
      const r = await fetch("/api/profile", {
        method: "PUT",
        body,
      });

      const d = await r.json();

      if (!r.ok) {
        setError(d.message || "Gagal memperbarui pengaturan akun");
        return;
      }

      setNotice(d.message || "Pengaturan akun berhasil diperbarui.");

      const latest = await fetch("/api/profile?me=1", {
        cache: "no-store",
      }).then((x) => x.json());

      setUser(latest.user);

      if (latest.user?.foto) {
        setPreview(latest.user.foto);
      }

      e.currentTarget.reset();
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-8 text-sm text-[#7185AF]">
        Memuat pengaturan akun...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A72]">
          Pengaturan Akun
        </h1>

        <p className="mt-1 text-sm text-[#6375A6]">
          Atur informasi login dan keamanan akun SchoolHub.
        </p>
      </div>

      <Notice text={notice} />
      <Notice text={error} error />

      <form
        onSubmit={save}
        className="space-y-6 rounded-3xl border border-[#DFEAF7] bg-white p-6 shadow-soft sm:p-8"
      >
        {/* =========================================
            FOTO PROFIL
        ========================================== */}

        <section>
          <h2 className="text-base font-extrabold text-[#102A72]">
            Foto Profil
          </h2>

          <p className="mt-1 text-xs text-[#7185AF]">
            Gunakan foto profil agar akunmu tidak terlihat polos. Maksimal 5 MB.
          </p>

          <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#E8F1FF] bg-[#E8F1FF]">
              {preview ? (
                <img
                  src={preview}
                  alt="Foto profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-3xl font-extrabold text-[#6D8DD6]">
                  {user.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                name="foto"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-[#6375A6] file:mr-3 file:rounded-xl file:border-0 file:bg-[#EAF2FF] file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-[#15449E] hover:file:bg-[#DDEBFF]"
              />

              <p className="mt-2 text-xs text-[#8A9ABB]">
                JPG, PNG, atau WEBP • Maksimal 5 MB
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-[#E8EFF7]" />

        {/* =========================================
            INFORMASI LOGIN
        ========================================== */}

        <section>
          <h2 className="text-base font-extrabold text-[#102A72]">
            Informasi Login
          </h2>

          <p className="mt-1 text-xs text-[#7185AF]">
            Username tidak dapat diubah dari halaman ini.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Username" value={user.username} disabled />

            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
            />
          </div>
        </section>

        <div className="border-t border-[#E8EFF7]" />

        {/* =========================================
            KEAMANAN
        ========================================== */}

        <section>
          <h2 className="text-base font-extrabold text-[#102A72]">
            Keamanan Akun
          </h2>

          <p className="mt-1 text-xs text-[#7185AF]">
            Kosongkan password jika tidak ingin mengubahnya.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="Password Baru"
              name="password"
              type="password"
              placeholder="Minimal 6 karakter"
            />

            <Field
              label="Konfirmasi Password"
              name="password_confirm"
              type="password"
              placeholder="Ulangi password baru"
            />
          </div>
        </section>

        <FormActions
          onCancel={() => location.reload()}
          submit={saving ? "Menyimpan..." : "Simpan Pengaturan"}
        />
      </form>
    </div>
  );
}

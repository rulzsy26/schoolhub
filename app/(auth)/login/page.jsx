"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen } from "@/components/Icons";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    identifier: "yurla@schoolhub.test",
    password: "password123",
    jenjang: "Guru",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      if (data.user?.role === "admin") {
        router.push("/dashboard");
      } else if (form.jenjang === "SMA") {
        router.push("/school/sma-negeri-37-jakarta/dashboard");
      } else {
        router.push("/school/smp-negeri-3-jakarta/dashboard");
      }

      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan saat menghubungkan ke server.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EAF5FF] via-white to-[#F3F7FF] p-5">
      <div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-6xl overflow-hidden rounded-[30px] border border-[#DDEAF8] bg-white shadow-soft lg:grid-cols-2">
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}
        <div className="relative hidden overflow-hidden bg-[#E8F4FF] p-12 lg:block">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/70" />

          <div className="absolute bottom-[-90px] right-[-50px] h-80 w-80 rounded-full bg-[#CBE6FF]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue text-white">
                <GraduationCap />
              </div>

              <div>
                <b className="text-2xl text-navy">SchoolHub</b>

                <div className="text-xs text-[#6375A6]">
                  Belajar Lebih Mudah
                </div>
              </div>
            </div>

            <div className="mt-24 max-w-md">
              <div className="text-5xl">🏫</div>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-navy">
                Satu tempat untuk belajar, mengajar, dan berkembang.
              </h1>

              <p className="mt-4 text-lg leading-8 text-[#52699E]">
                Kelola materi, tugas, nilai, kelas, dan pengumuman sekolah
                dengan lebih sederhana.
              </p>
            </div>

            <div className="absolute bottom-10 left-12 right-12 flex gap-4">
              <div className="rounded-2xl bg-white/80 p-4">
                <BookOpen className="text-blue" />

                <div className="mt-2 font-bold text-navy">Materi Belajar</div>
              </div>

              <div className="rounded-2xl bg-white/80 p-4">
                <ShieldCheck className="text-emerald-600" />

                <div className="mt-2 font-bold text-navy">
                  Akses Terproteksi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE - LOGIN
        ===================================================== */}
        <div className="flex items-center justify-center p-7 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-md">
            {/* MOBILE LOGO */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue text-white">
                <GraduationCap />
              </div>

              <b className="text-2xl text-navy">SchoolHub</b>
            </div>

            {/* TITLE */}
            <h2 className="text-3xl font-extrabold text-navy">
              Selamat datang kembali 👋
            </h2>

            <p className="mt-2 text-[#6579A9]">
              Masuk untuk melanjutkan ke dashboard SchoolHub.
            </p>

            {/* EMAIL / USERNAME */}
            <label className="mt-8 block text-sm font-bold text-navy">
              Email / Username
              <input
                value={form.identifier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    identifier: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-[#D8E6F6] px-4 py-3.5 outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                placeholder="Masukkan email atau username"
              />
            </label>

            {/* PASSWORD */}
            <label className="mt-5 block text-sm font-bold text-navy">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-[#D8E6F6] px-4 py-3.5 outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                placeholder="Masukkan password"
              />
            </label>

            {/* =================================================
                JENJANG SEKOLAH
            ================================================= */}
            <label className="mt-5 block text-sm font-bold text-navy">
              Jenjang
              <div className="relative mt-2">
                <select
                  value={form.jenjang}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      jenjang: e.target.value,
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-[#D8E6F6] bg-white px-4 py-3.5 pr-10 text-sm font-medium text-[#102A72] outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/10"
                >
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="Guru">Guru</option>
                </select>

                {/* CUSTOM ARROW */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6375A6]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </label>

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-blue py-3.5 font-bold text-white shadow-lg shadow-blue/20 transition hover:bg-[#0759E8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk ke SchoolHub"}
            </button>

            {/* DEMO ACCOUNT */}
            <div className="mt-7 rounded-2xl bg-[#F5F9FF] p-4 text-sm text-[#53699F]">
              <b>Demo akun</b>
              <br />
              Guru: <b>yurla@schoolhub.test</b> / password123
              <br />
              Siswa: <b>rafi@schoolhub.test</b> / password123
              <div className="mt-2 border-t border-[#DDEAF8] pt-2 text-xs text-[#7185AF]">
                Satu akun siswa dapat digunakan untuk SMP dan SMA.
                Pilih jenjang yang ingin dibuka.
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

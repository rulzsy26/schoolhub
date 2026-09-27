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
    <main className="min-h-screen bg-gradient-to-br from-[#EAF5FF] via-white to-[#F3F7FF] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-32px)] max-w-6xl overflow-hidden rounded-[28px] border border-[#DDEAF8] bg-white shadow-[0_20px_60px_rgba(16,42,114,0.10)] lg:min-h-[calc(100vh-48px)] lg:grid-cols-2">
        {/* =====================================================
          LEFT SIDE
      ===================================================== */}
        <section className="relative hidden overflow-hidden bg-[#E8F4FF] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          {/* Background decoration */}
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/70" />

          <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#CBE6FF]" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2563EB] text-white shadow-md">
                <GraduationCap />
              </div>

              <div>
                <div className="text-2xl font-extrabold text-[#102A72]">
                  SchoolHub
                </div>

                <div className="mt-0.5 text-xs text-[#6375A6]">
                  Belajar Lebih Mudah
                </div>
              </div>
            </div>

            {/* Hero */}
            <div className="mt-20 max-w-lg xl:mt-24">
              <div className="text-5xl">🏫</div>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] text-[#102A72] xl:text-[42px]">
                Satu tempat untuk belajar, mengajar, dan berkembang.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-[#52699E] xl:text-lg xl:leading-8">
                Kelola materi, tugas, nilai, kelas, dan pengumuman sekolah
                dengan lebih sederhana.
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="relative z-10 mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF2FF]">
                <BookOpen className="text-[#2563EB]" />
              </div>

              <div className="mt-3 text-sm font-bold text-[#102A72]">
                Materi Belajar
              </div>

              <p className="mt-1 text-xs leading-5 text-[#7185AF]">
                Akses materi dan tugas dalam satu tempat.
              </p>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ECFDF5]">
                <ShieldCheck className="text-emerald-600" />
              </div>

              <div className="mt-3 text-sm font-bold text-[#102A72]">
                Akses Terproteksi
              </div>

              <p className="mt-1 text-xs leading-5 text-[#7185AF]">
                Data sekolah dikelola dengan akses sesuai peran.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
          RIGHT SIDE
      ===================================================== */}
        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-14">
          <form onSubmit={submit} className="w-full max-w-[480px]">
            {/* MOBILE LOGO */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#2563EB] text-white shadow-md">
                <GraduationCap />
              </div>

              <div>
                <div className="text-xl font-extrabold text-[#102A72]">
                  SchoolHub
                </div>

                <div className="text-xs text-[#6375A6]">
                  Belajar Lebih Mudah
                </div>
              </div>
            </div>

            {/* TITLE */}
            <div>
              <h2 className="text-3xl font-extrabold leading-tight text-[#102A72] sm:text-[34px]">
                Selamat datang kembali 👋
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6579A9] sm:text-base">
                Masuk untuk melanjutkan ke dashboard SchoolHub.
              </p>
            </div>

            {/* EMAIL */}
            <label className="mt-8 block text-sm font-bold text-[#102A72]">
              Email / Username
              <input
                value={form.identifier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    identifier: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border border-[#D8E6F6] bg-white px-4 py-3.5 text-sm text-[#102A72] outline-none transition placeholder:text-[#9AAAC8] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                placeholder="Masukkan email atau username"
              />
            </label>

            {/* PASSWORD */}
            <label className="mt-5 block text-sm font-bold text-[#102A72]">
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
                className="mt-2 w-full rounded-xl border border-[#D8E6F6] bg-white px-4 py-3.5 text-sm text-[#102A72] outline-none transition placeholder:text-[#9AAAC8] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                placeholder="Masukkan password"
              />
            </label>

            {/* JENJANG */}
            <label className="mt-5 block text-sm font-bold text-[#102A72]">
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
                  className="w-full appearance-none rounded-xl border border-[#D8E6F6] bg-white px-4 py-3.5 pr-10 text-sm font-medium text-[#102A72] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                >
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="Guru">Guru</option>
                </select>

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
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#0759E8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk ke SchoolHub"}
            </button>

            {/* DEMO ACCOUNT */}
            <div className="mt-6 rounded-2xl border border-[#E2ECF8] bg-[#F5F9FF] p-4">
              <div className="text-sm font-bold text-[#102A72]">Demo akun</div>

              <div className="mt-2 space-y-1 text-sm text-[#53699F]">
                <div>
                  Guru: <b className="text-[#102A72]">yurla@schoolhub.test</b> /
                  password123
                </div>

                <div>
                  Siswa: <b className="text-[#102A72]">rafi@schoolhub.test</b> /
                  password123
                </div>
              </div>

              <div className="mt-3 border-t border-[#DDEAF8] pt-3 text-xs leading-5 text-[#7185AF]">
                Satu akun siswa dapat digunakan untuk SMP dan SMA. Pilih jenjang
                yang ingin dibuka.
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

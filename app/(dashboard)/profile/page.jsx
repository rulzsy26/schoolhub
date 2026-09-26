"use client";

import { useEffect, useState } from "react";
import { Notice } from "@/components/admin/Modal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [viewerRole, setViewerRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const r = await fetch("/api/profile", {
          cache: "no-store",
        });

        const d = await r.json();

        if (!r.ok) {
          throw new Error(d.message || "Profil tidak ditemukan");
        }

        if (!d.user) {
          throw new Error("Data profil tidak ditemukan");
        }

        setUser(d.user);
        setViewerRole(d.viewerRole || d.user.role);
      } catch (e) {
        setError(e.message);
      }
    };

    loadProfile();
  }, []);

  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-8 text-sm text-[#7185AF]">
        Memuat profil...
      </div>
    );
  }

  // Role yang sedang login
  const isTeacher = viewerRole === "admin";
  const isStudent = viewerRole === "user";

  // Kalau guru → profil dirinya
  // Kalau siswa → profil guru
  const subject = "IPS";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A72]">Profil Guru</h1>

        <p className="mt-1 text-sm text-[#6375A6]">
          {isTeacher
            ? "Informasi dan deskripsi guru di SchoolHub."
            : "Informasi guru yang mengajar kelas kamu."}
        </p>
      </div>

      <Notice text={error} error />

      {/* PROFILE CARD */}
      <section className="overflow-hidden rounded-3xl border border-[#DFEAF7] bg-white shadow-soft">
        {/* HEADER PROFILE */}
        <div className="bg-gradient-to-r from-[#E8F3FF] to-white px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* FOTO */}
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#DDEEFF] text-5xl shadow-sm">
              {user.foto ? (
                <img
                  src={user.foto}
                  alt={user.nama_lengkap}
                  className="h-full w-full object-cover"
                />
              ) : (
                "👨🏻‍🏫"
              )}
            </div>

            {/* NAMA */}
            <div>
              <h2 className="text-2xl font-extrabold text-[#102A72]">
                {user.nama_lengkap}
              </h2>

              <p className="mt-1 text-sm font-medium text-[#6375A6]">
                {subject}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-[#DCEBFF] px-3 py-1 text-xs font-bold text-blue-600">
                Guru
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-6 p-6 sm:p-8">
          {/* TENTANG */}
          <div>
            <h3 className="text-lg font-extrabold text-[#102A72]">
              Tentang Guru
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#6375A6]">
              {user.nama_lengkap} merupakan guru mata pelajaran {subject} di SMP
              Negeri 3 Jakarta yang mendampingi siswa dalam proses pembelajaran
              dan kegiatan akademik.
            </p>
          </div>

          {/* INFORMASI GURU */}
          <div className="rounded-2xl border border-[#E5EEF8] bg-[#F8FBFF] p-5">
            <h3 className="text-base font-extrabold text-[#102A72]">
              Informasi Guru
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {/* NAMA */}
              <InfoCard label="Nama Lengkap" value={user.nama_lengkap} />

              {/* USERNAME */}
              <InfoCard label="Username" value={user.username || "-"} />

              {/* EMAIL */}
              <InfoCard label="Email" value={user.email || "-"} />

              {/* JENIS KELAMIN */}
              <InfoCard
                label="Jenis Kelamin"
                value={user.jenis_kelamin || "-"}
              />

              {/* MATA PELAJARAN */}
              <InfoCard label="Mata Pelajaran" value={subject} />

              {/* KELAS */}
              <InfoCard
                label="Kelas Diampu"
                value={user.kelas_diampu || "Belum ada kelas"}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E3EDF8] bg-white px-4 py-3">
      <p className="text-xs font-semibold text-[#7185AF]">{label}</p>

      <p className="mt-1 text-sm font-bold text-[#102A72]">{value}</p>
    </div>
  );
}

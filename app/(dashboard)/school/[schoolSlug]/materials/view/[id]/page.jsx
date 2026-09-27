"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MaterialViewerPage() {
  const params = useParams();
  const router = useRouter();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  useEffect(() => {
    if (!params?.id) return;

    const loadMaterial = async () => {
      try {
        const res = await fetch(`/api/materials?id=${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil materi.");
        }

        if (!data.data) {
          throw new Error("Materi tidak ditemukan.");
        }

        setMaterial(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMaterial();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-5 text-sm font-semibold text-[#7185AF] shadow-soft">
          Memuat materi...
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
        <p className="font-semibold text-red-600">
          {error || "Materi tidak ditemukan."}
        </p>

        <button
          type="button"
          onClick={() => router.push(`/school/${params.schoolSlug}/materials`)}
          className="mt-4 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white"
        >
          Kembali
        </button>
      </div>
    );
  }

  const fileType = String(material.file_type || "").toUpperCase();

  const hasCanva = Boolean(material.canva_url);

  const isPowerPoint = fileType === "PPT" || fileType === "PPTX";

  /*
   * Canva Embed
   *
   * Jika guru memasukkan URL:
   * https://www.canva.com/design/xxxxx/view
   *
   * kita tambahkan ?embed agar digunakan
   * sebagai embedded presentation.
   */
  const canvaViewerUrl = material.canva_url
    ? `${material.canva_url}${
        material.canva_url.includes("?") ? "&" : "?"
      }embed`
    : "";

  /*
   * Office Online Viewer hanya digunakan
   * untuk PPT/PPTX yang tidak menggunakan Canva.
   */
  const officeViewerUrl =
    isPowerPoint && material.file_url
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          material.file_url,
        )}`
      : "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              router.push(`/school/${params.schoolSlug}/materials`)
            }
            className="inline-flex items-center gap-2 text-sm font-bold text-[#246BFD] transition hover:text-[#1554D1]"
          >
            ← Kembali ke Materi
          </button>

          <h1 className="mt-2 text-2xl font-extrabold text-[#102A72]">
            {material.judul}
          </h1>

          <p className="mt-1 text-sm text-[#7185AF]">
            {hasCanva ? "Presentasi Canva" : material.file_name || "Materi"}
          </p>
        </div>

        {material.file_url && !hasCanva && (
          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit rounded-xl bg-[#EFF6FF] px-4 py-2.5 text-sm font-bold text-[#2563EB]"
          >
            Buka File Asli
          </a>
        )}
      </div>

      {/* Viewer */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-[9999] bg-black"
            : "relative overflow-hidden rounded-2xl border border-[#DFEAF7] bg-white shadow-soft"
        }
      >
        {/* =========================
            CANVA
        ========================= */}
        {hasCanva ? (
          <>
            <div className="absolute right-4 top-4 z-20">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#102A72] shadow-lg transition hover:bg-gray-100"
              >
                {isFullscreen ? "✕ Keluar Fullscreen" : "⛶ Fullscreen"}
              </button>
            </div>

            <iframe
              src={canvaViewerUrl}
              title={material.judul || "Canva Presentation"}
              className={
                isFullscreen
                  ? "h-screen w-screen border-0"
                  : "h-[75vh] min-h-[600px] w-full border-0"
              }
              allowFullScreen
            />
          </>
        ) : isPowerPoint ? (
          /* =========================
             OFFICE ONLINE VIEWER
          ========================= */
          <>
            <div className="absolute right-4 top-4 z-20">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#102A72] shadow-lg transition hover:bg-gray-100"
              >
                {isFullscreen ? "✕ Keluar Fullscreen" : "⛶ Fullscreen"}
              </button>
            </div>

            <iframe
              src={officeViewerUrl}
              title={material.file_name || "PowerPoint Viewer"}
              className={
                isFullscreen
                  ? "h-screen w-screen border-0"
                  : "h-[75vh] min-h-[600px] w-full border-0"
              }
              frameBorder="0"
              allowFullScreen
            />
          </>
        ) : (
          /* =========================
             FILE BIASA
          ========================= */
          <div className="p-8 text-center">
            <p className="text-sm text-[#7185AF]">
              File ini tidak memiliki viewer khusus.
            </p>

            {material.file_url && (
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white"
              >
                Buka File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MaterialViewerPage() {
  const params = useParams();
  const router = useRouter();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white"
        >
          Kembali
        </button>
      </div>
    );
  }

  const fileType = String(material.file_type || "").toUpperCase();

  const viewerUrl =
    fileType === "PPT" || fileType === "PPTX"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          material.file_url,
        )}`
      : material.file_url;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 text-sm font-semibold text-[#2563EB]"
          >
            ← Kembali ke Materi
          </button>

          <h1 className="text-2xl font-extrabold text-[#102A72]">
            {material.judul}
          </h1>

          <p className="mt-1 text-sm text-[#7185AF]">
            {material.file_name || "PowerPoint"}
          </p>
        </div>

        {material.file_url && (
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
      <div className="overflow-hidden rounded-2xl border border-[#DFEAF7] bg-white shadow-soft">
        {fileType === "PPT" || fileType === "PPTX" ? (
          <iframe
            src={viewerUrl}
            title={material.file_name || "PowerPoint Viewer"}
            className="h-[75vh] min-h-[600px] w-full"
            frameBorder="0"
            allowFullScreen
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-[#7185AF]">File ini bukan PowerPoint.</p>

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

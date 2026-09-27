"use client";

import { useMemo } from "react";

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

export function isOfficeFile(fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase();

  return OFFICE_EXTENSIONS.includes(ext);
}

export default function OfficeViewer({
  open,
  onClose,
  fileUrl,
  fileName = "Dokumen",
}) {
  const viewerUrl = useMemo(() => {
    if (!fileUrl) return "";

    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      fileUrl,
    )}`;
  }, [fileUrl]);

  if (!open || !fileUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 p-3 sm:p-5">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E2EAF5] bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-[#102A72] sm:text-base">
              Preview Dokumen
            </div>

            <div className="mt-0.5 truncate text-xs text-[#7185AF]">
              {fileName}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg bg-[#F2F6FB] px-3 py-2 text-xs font-bold text-[#486398] transition hover:bg-[#E8F0FA] sm:inline-flex"
            >
              Buka File
            </a>

            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F1F6FC] text-[#5570A5] transition hover:bg-[#E7F1FF]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* VIEWER */}
        <div className="min-h-0 flex-1 bg-[#F5F7FA]">
          <iframe
            src={viewerUrl}
            title={`Preview ${fileName}`}
            className="h-full w-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

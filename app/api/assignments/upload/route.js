import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const allowedContentTypes = [
  // PDF
  "application/pdf",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // TXT
  "text/plain",

  // ZIP / RAR
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.rar",

  // Image
  "image/png",
  "image/jpeg",
];

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Hanya admin dan siswa yang boleh upload
  if (session.role !== "admin" && session.role !== "user") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname) => {
        // ==========================================
        // ADMIN → upload lampiran assignment
        // USER → upload file submission
        // ==========================================

        if (session.role === "admin") {
          if (!pathname.startsWith("assignments/")) {
            throw new Error("Path upload assignment tidak valid");
          }
        }

        if (session.role === "user") {
          if (!pathname.startsWith("submissions/")) {
            throw new Error("Path upload submission tidak valid");
          }
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("Vercel Blob upload berhasil:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("POST /api/assignments/upload ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal upload file",
        error: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}

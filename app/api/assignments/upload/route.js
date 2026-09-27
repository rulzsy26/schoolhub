import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";

const MAX_FILE_SIZE = 30 * 1024 * 1024;

const allowedContentTypes = [
  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain",

  "image/png",
  "image/jpeg",
];

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.role !== "admin") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const response = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("assignments/")) {
          throw new Error("Path upload tidak valid");
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log(
          "Assignment upload berhasil:",
          blob.url
        );
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "POST /api/assignments/upload ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Gagal upload lampiran",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
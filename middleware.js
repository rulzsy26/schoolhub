import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-secret",
);

const SCHOOLS = {
  SMP: {
    id: "1",
    slug: "smp-negeri-3-jakarta",
    name: "SMP Negeri 3 Jakarta",
  },
  SMA: {
    id: "2",
    slug: "sma-negeri-37-jakarta",
    name: "SMA Negeri 37 Jakarta",
  },
};

const SCHOOL_BY_SLUG = {
  "smp-negeri-3-jakarta": SCHOOLS.SMP,
  "sma-negeri-37-jakarta": SCHOOLS.SMA,
};

async function getSession(request) {
  const token = request.cookies.get("schoolhub_session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

function schoolFromCookie(request) {
  const value = request.cookies.get("schoolhub_school_id")?.value;
  return value === "2" ? SCHOOLS.SMA : SCHOOLS.SMP;
}

function sectionFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] || "dashboard";
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Login harus selalu bisa dibuka.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const session = await getSession(request);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = session.role;

  // ------------------------------------------------------
  // Tentukan sekolah aktif:
  // 1. dari URL /school/[slug]
  // 2. jika bukan URL sekolah, dari cookie pilihan terakhir
  // ------------------------------------------------------
  const schoolMatch = pathname.match(/^\/school\/([^/]+)/);
  const urlSchool = schoolMatch
    ? SCHOOL_BY_SLUG[schoolMatch[1]]
    : null;

  const activeSchool = urlSchool || schoolFromCookie(request);

  // ------------------------------------------------------
  // Halaman root lama diarahkan ke konteks sekolah aktif.
  // Berlaku untuk guru maupun siswa.
  // ------------------------------------------------------
  const rootSections = [
    "dashboard",
    "classes",
    "materials",
    "assignments",
    "grades",
    "attendance",
    "calendar",
    "profile",
    "account-settings",
  ];

  for (const section of rootSections) {
    if (
      pathname === `/${section}` ||
      pathname.startsWith(`/${section}/`)
    ) {
      const suffix = pathname.slice(section.length + 1);

      const destination = suffix
        ? `/school/${activeSchool.slug}/${section}/${suffix}`
        : `/school/${activeSchool.slug}/${section}`;

      const response = NextResponse.redirect(
        new URL(destination, request.url),
      );

      response.cookies.set(
        "schoolhub_school_id",
        activeSchool.id,
        {
          path: "/",
          sameSite: "lax",
        },
      );

      return response;
    }
  }

  // ------------------------------------------------------
  // /school/[slug] harus memakai sekolah dari URL.
  // Tidak ada lagi pembatas siswa berdasarkan users.jenjang.
  // Satu akun siswa boleh berpindah SMP <-> SMA.
  // ------------------------------------------------------
  if (schoolMatch && urlSchool) {
    // Siswa tidak boleh berganti jenjang hanya dengan membuka URL sekolah lain.
    // Untuk siswa, sekolah aktif ditentukan saat login dan tersimpan di cookie.
    // Guru/admin tetap boleh berpindah sekolah lewat dropdown.
    if (role !== "admin" && urlSchool.id !== activeSchool.id) {
      return NextResponse.redirect(
        new URL(`/school/${activeSchool.slug}/dashboard`, request.url),
      );
    }

    const response = NextResponse.next();

    response.cookies.set(
      "schoolhub_school_id",
      urlSchool.id,
      {
        path: "/",
        sameSite: "lax",
      },
    );

    return response;
  }

  // ------------------------------------------------------
  // Semua halaman lain tetap menggunakan sekolah aktif.
  // ------------------------------------------------------
  const response = NextResponse.next();

  response.cookies.set(
    "schoolhub_school_id",
    activeSchool.id,
    {
      path: "/",
      sameSite: "lax",
    },
  );

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/classes/:path*",
    "/materials/:path*",
    "/assignments/:path*",
    "/grades/:path*",
    "/calendar/:path*",
    "/profile/:path*",
    "/attendance/:path*",
    "/account-settings/:path*",
    "/school/:path*",
    "/login",
  ],
};

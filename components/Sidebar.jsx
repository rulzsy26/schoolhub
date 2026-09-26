"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  CalendarDays,
  UserRound,
  LogOut,
  HelpCircle,
  GraduationCap,
  ClipboardCheck,
} from "./Icons";

const teacherMenu = [
  ["Dashboard", "/dashboard", Home],
  ["My Classes", "/classes", Users],
  ["Learning Materials", "/materials", BookOpen],
  ["Assignments", "/assignments", ClipboardList],
  ["Penilaian Tugas", "/grades", BarChart3],
  ["Absensi", "/attendance", ClipboardCheck],
  ["Calendar", "/calendar", CalendarDays],
  ["Profile Guru", "/profile", UserRound],
];

const studentMenu = [
  ["Dashboard", "/dashboard", Home],
  ["Learning Materials", "/materials", BookOpen],
  ["Nilai Tugas", "/grades", BarChart3],
  ["Assignments", "/assignments", ClipboardList],
  ["Calendar", "/calendar", CalendarDays],
  ["Profile Guru", "/profile", UserRound],
];

export default function Sidebar({ role, mobileOpen, onClose }) {
  const pathname = usePathname();

  const schoolMatch = pathname.match(/^\/school\/([^/]+)/);
  const schoolSlug = schoolMatch?.[1] || "smp-negeri-3-jakarta";

  const prefix = `/school/${schoolSlug}`;

  const menu = role === "admin" ? teacherMenu : studentMenu;

  return (
    <>
      {/* OVERLAY MOBILE */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onClose}
          className="fixed inset-0 z-[50] bg-black/20 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-[60]
          flex h-screen w-[270px] flex-col
          overflow-y-auto
          border-r border-[#DCE9F8]
          bg-white
          px-5 py-7
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* BRAND + CLOSE BUTTON */}
        <div className="flex items-center justify-between px-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue text-white shadow-soft">
              <GraduationCap size={27} />
            </div>

            <div className="brand-copy min-w-0">
              <div className="text-[24px] font-extrabold tracking-tight text-[#102A72]">
                SchoolHub
              </div>

              <div className="text-xs text-[#6375A6]">Belajar Lebih Mudah</div>
            </div>
          </div>

          {/* TOMBOL X - MOBILE */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-[#203C88] transition hover:bg-[#F3F8FF] lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* MENU */}
        <nav className="mt-8 space-y-2">
          {menu.map(([label, href, Icon]) => {
            const schoolHref = `${prefix}${href}`;

            const active =
              pathname === schoolHref ||
              (href !== "/dashboard" && pathname.startsWith(schoolHref));

            return (
              <Link
                key={href}
                href={schoolHref}
                onClick={onClose}
                className={`
                  group flex items-center gap-4
                  rounded-xl px-4 py-3.5
                  text-[16px] font-medium
                  transition
                  ${
                    active
                      ? "bg-[#E7F1FF] text-blue shadow-sm"
                      : "text-[#102A72] hover:bg-[#F3F8FF]"
                  }
                `}
              >
                <span
                  className={`
                    grid h-9 w-9 place-items-center rounded-xl
                    ${active ? "bg-[#D8E9FF]" : "bg-transparent"}
                  `}
                >
                  <Icon size={22} />
                </span>

                <span className="label">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* QUOTE */}
        <div className="quote mt-auto rounded-3xl bg-[#F0F7FF] px-5 py-5 text-center text-[16px] italic leading-7 text-[#294995]">
          {role === "admin"
            ? "“Mengajar hari ini, membangun masa depan yang lebih baik.”"
            : "“Ilmu hari ini, masa depan yang lebih baik esok.”"}
        </div>

        {/* BOTTOM MENU */}
        <div className="mt-7 space-y-1">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[#102A72] hover:bg-[#F3F8FF]"
            >
              <LogOut size={22} />

              <span className="label">Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

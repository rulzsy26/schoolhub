"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import Link from "next/link";

import {
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  Settings,
  LogOut,
} from "./Icons";

export default function Header({ role, onMenuClick }) {
  const router = useRouter();
  const pathname = usePathname();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  // =====================================================
  // SCHOOL
  // =====================================================

  const [selectedSchool, setSelectedSchool] = useState("SMP Negeri 3 Jakarta");
  const schoolLogo =
    selectedSchool === "SMA Negeri 37 Jakarta"
      ? "/images/schools/logo-sman37.png"
      : "/images/schools/logo-smpn3.png";
  const [schoolOpen, setSchoolOpen] = useState(false);

  const [schoolPosition, setSchoolPosition] = useState({
    top: 0,
    left: 0,
  });

  const schoolButtonRef = useRef(null);
  const schoolPortalRef = useRef(null);

  // =====================================================
  // SEARCH
  // =====================================================

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const [searchPosition, setSearchPosition] = useState({
    top: 0,
    left: 0,
    width: 340,
  });

  const searchInputRef = useRef(null);
  const searchRef = useRef(null);
  const searchPortalRef = useRef(null);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({
    top: 0,
    right: 0,
  });

  const notificationButtonRef = useRef(null);
  const notificationPortalRef = useRef(null);

  // =====================================================
  // ACCOUNT REF
  // =====================================================

  const menuRef = useRef(null);

  // =====================================================
  // LOAD SELECTED SCHOOL
  // =====================================================

  useEffect(() => {
    const match = pathname.match(/^\/school\/([^/]+)/);

    if (match?.[1] === "sma-negeri-37-jakarta") {
      setSelectedSchool("SMA Negeri 37 Jakarta");
      localStorage.setItem(
        "schoolhub_selected_school",
        "SMA Negeri 37 Jakarta",
      );
      return;
    }

    if (match?.[1] === "smp-negeri-3-jakarta") {
      setSelectedSchool("SMP Negeri 3 Jakarta");
      localStorage.setItem("schoolhub_selected_school", "SMP Negeri 3 Jakarta");
      return;
    }

    const savedSchool = localStorage.getItem("schoolhub_selected_school");

    if (
      savedSchool === "SMP Negeri 3 Jakarta" ||
      savedSchool === "SMA Negeri 37 Jakarta"
    ) {
      setSelectedSchool(savedSchool);
    }
  }, [pathname]);

  // =====================================================
  // SCHOOL POSITION
  // =====================================================

  useEffect(() => {
    if (!schoolOpen || !schoolButtonRef.current) {
      return;
    }

    const updateSchoolPosition = () => {
      if (!schoolButtonRef.current) return;

      const rect = schoolButtonRef.current.getBoundingClientRect();

      setSchoolPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    };

    updateSchoolPosition();

    window.addEventListener("resize", updateSchoolPosition);

    window.addEventListener("scroll", updateSchoolPosition, true);

    return () => {
      window.removeEventListener("resize", updateSchoolPosition);

      window.removeEventListener("scroll", updateSchoolPosition, true);
    };
  }, [schoolOpen]);

  // =====================================================
  // CHANGE SCHOOL
  // =====================================================

  const changeSchool = (school) => {
    const slug =
      school === "SMA Negeri 37 Jakarta"
        ? "sma-negeri-37-jakarta"
        : "smp-negeri-3-jakarta";

    setSelectedSchool(school);

    localStorage.setItem("schoolhub_selected_school", school);

    setSchoolOpen(false);

    const match = pathname.match(/^\/school\/[^/]+(?:\/([^/]+))?/);

    const section = match?.[1] || "dashboard";

    router.push(`/school/${slug}/${section}`);
  };
  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("LOAD USER ERROR:", error);
      }
    };

    loadUser();

    const handleFocus = () => {
      loadUser();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.error("NOTIFICATION JSON PARSE ERROR:", responseText);
      }

      if (!response.ok) {
        console.error("NOTIFICATION API ERROR:", data?.message || responseText);
        setNotifications([]);
        return;
      }

      setNotifications(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("NOTIFICATION FETCH ERROR:", error);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, [selectedSchool, role]);

  // =====================================================
  // NOTIFICATION POSITION
  // =====================================================

  useEffect(() => {
    if (!notificationOpen || !notificationButtonRef.current) return;

    const updateNotificationPosition = () => {
      if (!notificationButtonRef.current) return;
      const rect = notificationButtonRef.current.getBoundingClientRect();
      setNotificationPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };

    updateNotificationPosition();
    window.addEventListener("resize", updateNotificationPosition);
    window.addEventListener("scroll", updateNotificationPosition, true);

    return () => {
      window.removeEventListener("resize", updateNotificationPosition);
      window.removeEventListener("scroll", updateNotificationPosition, true);
    };
  }, [notificationOpen]);

  // =====================================================
  // CLICK OUTSIDE
  // =====================================================

  useEffect(() => {
    const closeMenus = (event) => {
      const target = event.target;

      // -----------------------------------------------
      // ACCOUNT
      // -----------------------------------------------

      if (menuRef.current && !menuRef.current.contains(target)) {
        setAccountOpen(false);
      }

      // -----------------------------------------------
      // SCHOOL
      // -----------------------------------------------

      const clickedSchoolButton = schoolButtonRef.current?.contains(target);

      const clickedSchoolDropdown = schoolPortalRef.current?.contains(target);

      if (!clickedSchoolButton && !clickedSchoolDropdown) {
        setSchoolOpen(false);
      }

      // -----------------------------------------------
      // NOTIFICATION
      // -----------------------------------------------

      const clickedNotificationButton =
        notificationButtonRef.current?.contains(target);
      const clickedNotificationDropdown =
        notificationPortalRef.current?.contains(target);

      if (!clickedNotificationButton && !clickedNotificationDropdown) {
        setNotificationOpen(false);
      }

      // -----------------------------------------------
      // SEARCH
      // -----------------------------------------------

      const clickedSearchInput = searchRef.current?.contains(target);

      const clickedSearchResult = searchPortalRef.current?.contains(target);

      if (!clickedSearchInput && !clickedSearchResult) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
    };
  }, []);

  // =====================================================
  // SEARCH POSITION
  // =====================================================

  useEffect(() => {
    if (!searchOpen || !searchInputRef.current) {
      return;
    }

    const updateSearchPosition = () => {
      if (!searchInputRef.current) return;

      const rect = searchInputRef.current.getBoundingClientRect();

      setSearchPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updateSearchPosition();

    window.addEventListener("resize", updateSearchPosition);

    window.addEventListener("scroll", updateSearchPosition, true);

    return () => {
      window.removeEventListener("resize", updateSearchPosition);

      window.removeEventListener("scroll", updateSearchPosition, true);
    };
  }, [searchOpen]);

  // =====================================================
  // UNIVERSAL SEARCH
  // =====================================================

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (error) {
          console.error("SEARCH JSON PARSE ERROR:", error);
        }

        if (!response.ok) {
          console.error(
            "SEARCH API ERROR:",
            data?.message || responseText || "Unknown error",
          );

          setResults([]);
          setSearchOpen(true);
          return;
        }

        setResults(Array.isArray(data?.data) ? data.data : []);

        setSearchOpen(true);
      } catch (error) {
        console.error("SEARCH FETCH ERROR:", error);

        setResults([]);
        setSearchOpen(true);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // =====================================================
  // OPEN SEARCH RESULT
  // =====================================================

  const openSearchResult = (item) => {
    if (!item?.href) return;

    setSearchOpen(false);
    setQuery("");
    setResults([]);

    const slug =
      selectedSchool === "SMA Negeri 37 Jakarta"
        ? "sma-negeri-37-jakarta"
        : "smp-negeri-3-jakarta";
    const href = String(item.href).startsWith("/school/")
      ? item.href
      : `/school/${slug}${item.href}`;
    router.push(href);
  };

  // =====================================================
  // SEARCH KEYBOARD
  // =====================================================

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (results.length > 0) {
        openSearchResult(results[0]);
      }
    }
  };

  // =====================================================
  // USER DISPLAY
  // =====================================================

  const name =
    user?.nama_lengkap || (role === "admin" ? "Budi Santoso" : "Rafi Ahmad");

  const subtitle = role === "admin" ? "Guru IPS" : "Siswa";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="relative z-50 border-b border-[#E1ECF8] bg-white px-3 py-3 sm:px-7 lg:px-8">
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#203C88] transition hover:bg-[#F2F7FF] lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          {/* =================================================
            LEFT - SCHOOL
        ================================================= */}

          <div className="flex min-w-0 items-center gap-2">
            {role === "admin" ? (
              <button
                ref={schoolButtonRef}
                type="button"
                onClick={() => setSchoolOpen((previous) => !previous)}
                className="flex max-w-[190px] items-center gap-2 rounded-xl px-1 py-1.5 text-left transition hover:bg-[#F3F8FF] sm:max-w-[320px]"
                aria-label="Pilih sekolah"
                aria-expanded={schoolOpen}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white">
                      <img
                        src={schoolLogo}
                        alt={`Logo ${selectedSchool}`}
                        className="h-10 w-10 object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-base font-extrabold text-[#102A72] sm:text-lg">
                          {selectedSchool}
                        </span>

                        <ChevronDown
                          size={17}
                          className={`shrink-0 text-[#203C88] transition-transform ${
                            schoolOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </div>

                      <div className="text-xs text-[#6375A6]">
                        Berprestasi, Berkarakter, Berwawasan Global
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="min-w-0 max-w-full px-1 py-1.5">
                <div className="truncate text-base font-extrabold text-[#102A72] sm:text-lg">
                  {selectedSchool}
                </div>

                <div className="truncate text-xs text-[#6375A6]">
                  Jenjang aktif dari login
                </div>
              </div>
            )}
          </div>

          {/* =================================================
            RIGHT
        ================================================= */}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
            {/* =================================================
              SEARCH
          ================================================= */}

            <div ref={searchRef} className="relative hidden sm:block">
              <div className="flex h-12 w-[230px] items-center gap-3 rounded-full border border-[#D7E7FA] bg-[#F7FBFF] px-4 sm:w-[280px] lg:w-[340px]">
                <Search size={20} className="shrink-0 text-[#6579A9]" />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => {
                    if (query.trim().length >= 2) {
                      setSearchOpen(true);
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#7890BA]"
                  placeholder={
                    role === "admin"
                      ? "Cari siswa, kelas, materi, atau tugas..."
                      : "Cari materi, tugas, atau pengumuman..."
                  }
                />
              </div>
            </div>
          </div>

          {/* =================================================
              NOTIFICATION
          ================================================= */}

          <button
            ref={notificationButtonRef}
            type="button"
            onClick={() => {
              setNotificationOpen((value) => !value);
              if (!notificationOpen) loadNotifications();
            }}
            className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-[#F2F7FF]"
            aria-label="Notifikasi"
            aria-expanded={notificationOpen}
          >
            <Bell size={22} className="text-[#203C88]" />

            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </button>

          <div className="hidden h-11 w-px bg-[#E1ECF8] sm:block" />

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <div className="relative z-[100]" ref={menuRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((value) => !value)}
              className="flex shrink-0 items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#F3F8FF]"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#E8F1FF]">
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt={user.nama_lengkap || "Foto profil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-extrabold text-[#5272B8]">
                    {name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <div className="truncate text-sm font-bold text-[#102A72]">
                  {name}
                </div>

                <div className="text-xs text-[#6375A6]">{subtitle}</div>
              </div>

              <ChevronRight
                size={16}
                className={`hidden shrink-0 text-[#203C88] transition-transform sm:block ${
                  accountOpen ? "-rotate-90" : "rotate-90"
                }`}
              />
            </button>

            {/* ACCOUNT DROPDOWN */}

            {accountOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-[9999] w-60 overflow-hidden rounded-2xl border border-[#DFEAF7] bg-white p-2 shadow-xl">
                <div className="border-b border-[#E8EFF7] px-3 py-3">
                  <p className="text-sm font-extrabold text-[#102A72]">
                    {name}
                  </p>

                  <p className="mt-0.5 text-xs text-[#7185AF]">{subtitle}</p>
                </div>

                <Link
                  href={`/school/${selectedSchool === "SMA Negeri 37 Jakarta" ? "sma-negeri-37-jakarta" : "smp-negeri-3-jakarta"}/account-settings`}
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#102A72] hover:bg-[#F3F8FF]"
                >
                  <Settings size={18} />
                  Pengaturan Akun
                </Link>

                <div className="my-1 border-t border-[#E8EFF7]" />

                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 block sm:hidden">
          <div
            ref={searchRef}
            className="flex h-11 w-full items-center gap-3 rounded-full border border-[#D7E7FA] bg-[#F7FBFF] px-4"
          >
            <Search size={19} className="shrink-0 text-[#6579A9]" />

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                if (query.trim().length >= 2) {
                  setSearchOpen(true);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#7890BA]"
              placeholder={
                role === "admin"
                  ? "Cari siswa, kelas, materi..."
                  : "Cari materi, tugas..."
              }
            />
          </div>
        </div>
      </header>

      {/* =================================================
          SCHOOL DROPDOWN PORTAL
          
          PENTING:
          Dropdown dibuat langsung ke document.body
          supaya tidak tertutup oleh hero/dashboard.
      ================================================= */}

      {role === "admin" &&
        schoolOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={schoolPortalRef}
            className="fixed w-[280px] overflow-hidden rounded-2xl border border-[#DCE9F8] bg-white shadow-2xl"
            style={{
              top: schoolPosition.top,
              left: schoolPosition.left,
              zIndex: 2147483647,
              backgroundColor: "#FFFFFF",
              opacity: 1,
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* HEADER DROPDOWN */}

            <div className="border-b border-[#E8EFF7] bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#7185AF]">
                Pilih Sekolah
              </p>
            </div>

            {/* OPTIONS */}

            <div className="bg-white p-2">
              {/* SMP */}

              <button
                type="button"
                onClick={() => changeSchool("SMP Negeri 3 Jakarta")}
                className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#102A72] transition hover:bg-[#F3F8FF]"
              >
                <span>SMP Negeri 3 Jakarta</span>

                {selectedSchool === "SMP Negeri 3 Jakarta" && (
                  <span className="font-bold text-blue-600">✓</span>
                )}
              </button>

              {/* SMA */}

              <button
                type="button"
                onClick={() => changeSchool("SMA Negeri 37 Jakarta")}
                className="mt-1 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#102A72] transition hover:bg-[#F3F8FF]"
              >
                <span>SMA Negeri 37 Jakarta</span>

                {selectedSchool === "SMA Negeri 37 Jakarta" && (
                  <span className="font-bold text-blue-600">✓</span>
                )}
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* =================================================
          NOTIFICATION PORTAL
      ================================================= */}

      {notificationOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={notificationPortalRef}
            className="fixed z-[999999] w-[360px] overflow-hidden rounded-2xl border border-[#DFEAF7] bg-white shadow-2xl"
            style={{
              top: notificationPosition.top,
              right: notificationPosition.right,
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8EFF7] px-4 py-3">
              <div>
                <p className="text-sm font-extrabold text-[#102A72]">
                  Notifikasi
                </p>
                <p className="mt-0.5 text-xs text-[#7185AF]">
                  Aktivitas terbaru sekolah
                </p>
              </div>

              {notifications.length > 0 && (
                <span className="rounded-full bg-[#E8F3FF] px-2.5 py-1 text-[11px] font-bold text-[#2563EB]">
                  {notifications.length} terbaru
                </span>
              )}
            </div>

            {notificationLoading ? (
              <div className="px-4 py-8 text-center text-sm font-semibold text-[#7185AF]">
                Memuat notifikasi...
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}-${index}`}
                    type="button"
                    onClick={() => {
                      setNotificationOpen(false);
                      const slug =
                        selectedSchool === "SMA Negeri 37 Jakarta"
                          ? "sma-negeri-37-jakarta"
                          : "smp-negeri-3-jakarta";
                      const href = String(item.href || "/dashboard").startsWith(
                        "/school/",
                      )
                        ? item.href
                        : `/school/${slug}${item.href || "/dashboard"}`;
                      router.push(href);
                    }}
                    className="flex w-full gap-3 border-b border-[#EEF3F8] px-4 py-3 text-left transition hover:bg-[#F5F9FF]"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F3FF]">
                      {item.type === "assignment"
                        ? "📝"
                        : item.type === "material"
                          ? "📚"
                          : item.type === "calendar"
                            ? "📅"
                            : "📢"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#102A72]">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7185AF]">
                        {item.message}
                      </p>
                      {item.created_at && (
                        <p className="mt-1 text-[10px] font-semibold text-[#9AA9C4]">
                          {new Date(item.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>

                    <ChevronRight
                      size={16}
                      className="mt-1 shrink-0 text-[#9AA9C4]"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#F1F6FC]">
                  <Bell size={21} className="text-[#8AA0C4]" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#102A72]">
                  Tidak ada notifikasi
                </p>
                <p className="mt-1 text-xs text-[#7185AF]">
                  Belum ada aktivitas baru.
                </p>
              </div>
            )}
          </div>,
          document.body,
        )}

      {/* =================================================
          SEARCH RESULT PORTAL
      ================================================= */}

      {searchOpen &&
        query.trim().length >= 2 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={searchPortalRef}
            className="fixed z-[999999] overflow-hidden rounded-2xl border border-[#DFEAF7] bg-white shadow-2xl"
            style={{
              top: searchPosition.top,
              left: searchPosition.left,
              width: searchPosition.width,
            }}
          >
            {/* SEARCH HEADER */}

            <div className="border-b border-[#E8EFF7] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8AA0C4]">
                Hasil Pencarian
              </p>

              <p className="mt-0.5 truncate text-sm font-bold text-[#102A72]">
                "{query}"
              </p>
            </div>

            {/* SEARCH RESULT */}

            {results.length > 0 ? (
              <div className="max-h-[420px] overflow-y-auto p-2">
                {results.map((item, index) => (
                  <button
                    key={`${item.type}-${item.id}-${index}`}
                    type="button"
                    onClick={() => openSearchResult(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F3F8FF]"
                  >
                    {/* ICON */}

                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E8F3FF] text-xs font-extrabold text-[#2563EB]">
                      {item.type?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-[#102A72]">
                          {item.title}
                        </span>
                      </div>

                      {item.subtitle && (
                        <div className="mt-0.5 truncate text-xs text-[#7185AF]">
                          {item.subtitle}
                        </div>
                      )}

                      <div className="mt-1 text-[11px] font-semibold text-[#2563EB]">
                        {item.type}
                      </div>
                    </div>

                    {/* ARROW */}

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-[#9AA9C4]"
                    />
                  </button>
                ))}
              </div>
            ) : (
              /* NO RESULT */

              <div className="px-4 py-8 text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#F1F6FC]">
                  <Search size={20} className="text-[#8AA0C4]" />
                </div>

                <p className="mt-3 text-sm font-bold text-[#102A72]">
                  Tidak ada hasil
                </p>

                <p className="mt-1 text-xs text-[#7185AF]">
                  Tidak ditemukan hasil untuk "{query}"
                </p>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

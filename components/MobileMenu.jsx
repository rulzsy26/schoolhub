'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, ClipboardList, BarChart3, CalendarDays, UserRound, LogOut, HelpCircle, GraduationCap, Menu, X } from './Icons';

const teacherMenu = [
  ['Dashboard','/dashboard',Home],
  ['My Classes','/classes',Users],
  ['Learning Materials','/materials',BookOpen],
  ['Assignments','/assignments',ClipboardList],
  ['Student Grades','/grades',BarChart3],
  ['Calendar','/calendar',CalendarDays],
  ['Profile Guru','/profile',UserRound],
];

const studentMenu = [
  ['Dashboard','/dashboard',Home],
  ['Learning Materials','/materials',BookOpen],
  ['Grades','/grades',BarChart3],
  ['Assignments','/assignments',ClipboardList],
  ['Calendar','/calendar',CalendarDays],
  ['Profile Siswa','/profile',UserRound],
];

export default function MobileMenu({ role }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const schoolMatch = pathname.match(/^\/school\/([^/]+)/);
  const schoolSlug = schoolMatch?.[1] || 'smp-negeri-3-jakarta';
  const prefix = `/school/${schoolSlug}`;
  const menu = role === 'admin' ? teacherMenu : studentMenu;

  return (
    <>
      <button
        type="button"
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
        className="mobile-menu-button grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#102A72] hover:bg-[#F2F7FF]"
      >
        <Menu size={23} />
      </button>

      {open && <div className="fixed inset-0 z-[70] bg-[#102A72]/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />}

      <aside className={`mobile-drawer fixed left-0 top-0 z-[80] flex h-full w-[min(86vw,330px)] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#E1ECF8] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue text-white"><GraduationCap size={24}/></div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#102A72]">SchoolHub</div>
              <div className="text-[11px] text-[#6375A6]">Belajar Lebih Mudah</div>
            </div>
          </div>
          <button type="button" aria-label="Tutup menu" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl text-[#52699E] hover:bg-[#F3F8FF]"><X size={22}/></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-[#8A9BBE]">Menu</div>
          <div className="space-y-1.5">
            {menu.map(([label, href, Icon]) => {
              const schoolHref = `${prefix}${href}`;
              const active = pathname === schoolHref || (href !== '/dashboard' && pathname.startsWith(schoolHref));
              return (
                <Link key={href} href={schoolHref} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-[15px] font-medium ${active ? 'bg-[#E7F1FF] text-blue' : 'text-[#102A72] hover:bg-[#F3F8FF]'}`}>
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? 'bg-[#D8E9FF]' : 'bg-[#F7FAFF]'}`}><Icon size={20}/></span>
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-[#F0F7FF] px-4 py-4 text-center text-sm italic leading-6 text-[#294995]">
            {role === 'admin' ? '“Mengajar hari ini, membangun masa depan yang lebih baik.”' : '“Ilmu hari ini, masa depan yang lebih baik esok.”'}
          </div>
        </nav>

        <div className="border-t border-[#E1ECF8] p-4">
          <Link href={`${prefix}/profile`} onClick={() => setOpen(false)} className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-[#102A72] hover:bg-[#F3F8FF]"><HelpCircle size={20}/>Bantuan</Link>
          <form action="/api/auth/logout" method="post">
            <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[#102A72] hover:bg-[#F3F8FF]"><LogOut size={20}/>Logout</button>
          </form>
        </div>
      </aside>
    </>
  );
}

'use client';
import Link from 'next/link';
import { ChevronRight } from './Icons';

export function StatCard({ icon, value, label, tone='blue', href }) {
  const tones = { red:'bg-red-50 text-red-500', blue:'bg-blue-50 text-blue', green:'bg-emerald-50 text-emerald-600', purple:'bg-purple-50 text-purple-600' };
  const content = <><div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.blue}`}>{icon}</div><div className="min-w-0"><div className="text-3xl font-extrabold text-[#163C9B]">{value}</div><div className="text-sm leading-5 text-[#53699F]">{label}</div></div><ChevronRight className="ml-auto text-[#4E6AA9]" size={21}/></>;
  return href ? <Link href={href} className="flex min-h-[102px] items-center gap-4 rounded-2xl border border-[#E0EBF7] bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">{content}</Link> : <div className="flex min-h-[102px] items-center gap-4 rounded-2xl border border-[#E0EBF7] bg-white p-4 shadow-soft">{content}</div>;
}

export function Section({ title, action='Lihat Semua', actionHref, children, className='' }) {
  return <section className={`rounded-2xl border border-[#DFEAF7] bg-white p-4 shadow-soft ${className}`}>
    <div className="mb-3 flex items-center justify-between gap-4"><h2 className="text-lg font-extrabold text-[#102A72]">{title}</h2>{action && (actionHref ? <Link href={actionHref} className="flex items-center gap-1 text-sm font-medium text-blue">{action}<ChevronRight size={16}/></Link> : <span className="flex items-center gap-1 text-sm font-medium text-blue">{action}<ChevronRight size={16}/></span>)}</div>
    {children}
  </section>;
}

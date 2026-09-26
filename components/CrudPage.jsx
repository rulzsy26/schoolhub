"use client";
import { useState } from "react";
import { Plus, Search } from "./Icons";

export default function CrudPage({
  title,
  subtitle,
  button = "Tambah Data",
  columns = [],
  rows = [],
}) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((row) =>
    Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
          <p className="mt-1 text-sm text-[#6375A6]">{subtitle}</p>
        </div>
        {button && (
          <button className="flex items-center justify-center gap-2 rounded-xl bg-blue px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue/20">
            <Plus size={18} />
            {button}
          </button>
        )}
      </div>
      <div className="rounded-2xl border border-[#DFEAF7] bg-white p-4 shadow-soft">
        <div className="mb-4 flex h-11 max-w-sm items-center gap-2 rounded-xl border border-[#D8E6F6] px-3">
          <Search size={18} className="text-[#6579A9]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari..."
            className="w-full outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr className="border-b border-[#E8EFF7] text-xs uppercase text-[#7185AF]">
                {columns.map((c) => (
                  <th key={c.key} className="px-3 py-3">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[#F0F4F8] last:border-0 hover:bg-[#F9FBFE]"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-4 text-sm text-[#243B78]"
                    >
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[#7185AF]">
              Data tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

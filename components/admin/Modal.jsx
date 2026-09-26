"use client";

export function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102A72]/30 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className={`max-h-[90vh] w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#102A72]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#F1F6FC] text-[#5570A5] hover:bg-[#E7F1FF]"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function Field({ label, required = false, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#243B78]">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        {...props}
        className="w-full rounded-xl border border-[#D9E6F5] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export function Textarea({ label, required = false, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#243B78]">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <textarea
        {...props}
        className="min-h-28 w-full resize-y rounded-xl border border-[#D9E6F5] bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export function Select({ label, required = false, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#243B78]">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <select
        {...props}
        className="w-full rounded-xl border border-[#D9E6F5] bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

export function FormActions({ onCancel, submit = "Simpan", loading = false }) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        style={{
          backgroundColor: "#FFFFFF",
          color: "#486398",
          border: "1px solid #D9E6F5",
        }}
        className="rounded-xl px-5 py-2.5 text-sm font-bold transition hover:bg-gray-50 disabled:opacity-50"
      >
        Batal
      </button>

      <button
        type="submit"
        disabled={loading}
        style={{
          backgroundColor: "#2563EB",
          color: "#FFFFFF",
          border: "1px solid #2563EB",
        }}
        className="rounded-xl px-5 py-2.5 text-sm font-bold shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : submit}
      </button>
    </div>
  );
}

export function PageHeader({ title, subtitle, button, onClick }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A72]">{title}</h1>

        {subtitle && <p className="mt-1 text-sm text-[#6375A6]">{subtitle}</p>}
      </div>

      {button && (
        <button
          type="button"
          onClick={onClick}
          style={{
            backgroundColor: "#2563EB",
            color: "#FFFFFF",
          }}
          className="rounded-xl px-5 py-3 text-sm font-bold shadow-md transition hover:opacity-90 active:scale-[0.98]"
        >
          ＋ {button}
        </button>
      )}
    </div>
  );
}

export function Notice({ text, error = false }) {
  if (!text) return null;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
        error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {text}
    </div>
  );
}

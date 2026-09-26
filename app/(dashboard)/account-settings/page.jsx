'use client';

import { useEffect, useState } from 'react';
import { Field, FormActions, Notice } from '@/components/admin/Modal';

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => setUser(d.user))
      .catch(e => setError(e.message));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password') || '');
    const passwordConfirm = String(fd.get('password_confirm') || '');

    if (password && password !== passwordConfirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    const body = {
      nama_lengkap: user.nama_lengkap,
      email: String(fd.get('email') || '').trim(),
      jenis_kelamin: user.jenis_kelamin || '',
      password,
    };

    const r = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json();

    if (!r.ok) {
      setError(d.message || 'Gagal memperbarui pengaturan akun');
      return;
    }

    setNotice(d.message || 'Pengaturan akun berhasil diperbarui.');
    const latest = await fetch('/api/profile').then(x => x.json());
    setUser(latest.user);
    e.currentTarget.reset();
  };

  if (!user) return <div className="rounded-2xl bg-white p-8 text-sm text-[#7185AF]">Memuat pengaturan akun...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#102A72]">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-[#6375A6]">Atur informasi login dan keamanan akun SchoolHub.</p>
      </div>

      <Notice text={notice} />
      <Notice text={error} error />

      <form onSubmit={save} className="space-y-6 rounded-3xl border border-[#DFEAF7] bg-white p-6 shadow-soft sm:p-8">
        <section>
          <h2 className="text-base font-extrabold text-[#102A72]">Informasi Login</h2>
          <p className="mt-1 text-xs text-[#7185AF]">Username tidak dapat diubah dari halaman ini.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Username" value={user.username} disabled />
            <Field label="Email" name="email" type="email" defaultValue={user.email} required />
          </div>
        </section>

        <div className="border-t border-[#E8EFF7]" />

        <section>
          <h2 className="text-base font-extrabold text-[#102A72]">Keamanan Akun</h2>
          <p className="mt-1 text-xs text-[#7185AF]">Kosongkan password jika tidak ingin mengubahnya.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Password Baru" name="password" type="password" placeholder="Minimal 6 karakter" />
            <Field label="Konfirmasi Password" name="password_confirm" type="password" placeholder="Ulangi password baru" />
          </div>
        </section>

        <FormActions onCancel={() => location.reload()} submit="Simpan Pengaturan" />
      </form>
    </div>
  );
}

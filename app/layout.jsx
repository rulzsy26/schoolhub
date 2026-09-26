import './globals.css';

export const metadata = {
  title: 'SchoolHub — Belajar Lebih Mudah',
  description: 'Sistem informasi sekolah SchoolHub',
};

export default function RootLayout({ children }) {
  return <html lang="id"><body>{children}</body></html>;
}

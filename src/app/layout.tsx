import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carta Miranda",
  description: "Hub de cartas con dos cuentas fijas, borradores y historial visible.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✉️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full bg-[#0b0508] text-rose-50">{children}</body>
    </html>
  );
}

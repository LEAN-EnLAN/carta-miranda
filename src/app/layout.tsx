import type { Metadata } from "next";
import { Chivo, Piazzolla } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/notification-provider";

const serif = Piazzolla({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Chivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carta Miranda",
  description: "Hub de cartas con dos cuentas fijas, borradores y historial visible.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "carta-miranda",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✉️</text></svg>",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[color:var(--background)] font-sans text-[color:var(--foreground)]">
        {children}
        <NotificationProvider />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ANTRI-CAPIL — Pelayanan Adminduk Disdukcapil Kab. Sambas",
  description: "Sistem Antrean Digital Disdukcapil Kabupaten Sambas. Ambil tiket online instan dengan NIK tanpa wajib password, dapatkan Smart Ticket QR, dan pantau status panggilan dari HP.",
  icons: { icon: "/logo-sambas.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col w-full max-w-full overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

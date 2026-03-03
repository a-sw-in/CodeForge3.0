'use client';

import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LoadingWrapper from "../ui/LoadingWrapper";
import FloatingDockDemo from "../ui/floating-demo";
import { usePathname } from "next/navigation";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${plusJakarta.variable} antialiased`}
        style={{ background: '#FFFDF5' }}
      >
        {!isAdminRoute && <FloatingDockDemo />}
        <LoadingWrapper>
          {children}
        </LoadingWrapper>
      </body>
    </html>
  );
}

'use client';

import { Outfit, Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";
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

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: ["400"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} ${outfit.variable} ${plusJakarta.variable} antialiased`}
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

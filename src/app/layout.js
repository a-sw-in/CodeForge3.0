'use client';

import { useEffect } from 'react';
import { Outfit, Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LoadingWrapper from "../ui/LoadingWrapper";
import FloatingDockDemo from "../ui/floating-demo";
import NotificationBell from "../app/components/NotificationBell";
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
  const isTimerRoute = pathname === '/timer';
  const isDev = process.env.NODE_ENV === 'development';

  // Set page title
  useEffect(() => {
    document.title = 'CodeForge 3.0';
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Security Script - Load early to protect against console manipulation */}
        <Script
          src="/security.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${pressStart2P.variable} ${outfit.variable} ${plusJakarta.variable} antialiased`}
        style={{ background: '#FFFDF5' }}
      >
        {!isAdminRoute && !isTimerRoute && (
          <>
            <FloatingDockDemo />
            {isDev && <NotificationBell />}
          </>
        )}
        <LoadingWrapper>
          {children}
        </LoadingWrapper>
      </body>
    </html>
  );
}

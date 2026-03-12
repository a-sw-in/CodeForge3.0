"use client"

import { FloatingDock } from "./floating-dock"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  IconHome,
  IconCalendarEvent,
  IconTrophy,
  IconInfoCircle,
  IconCode,
  IconMail,
} from "@tabler/icons-react"

export default function FloatingDockDemo() {
  const pathname = usePathname()
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  useEffect(() => {
    // Check if user is logged out (no session in localStorage)
    const sessionData = localStorage.getItem('teamSession')
    setIsLoggedOut(!sessionData)

    // Listen for session changes
    const handleSessionChange = () => {
      const sessionData = localStorage.getItem('teamSession')
      setIsLoggedOut(!sessionData)
    }

    window.addEventListener('sessionUpdate', handleSessionChange)
    window.addEventListener('storage', handleSessionChange)

    return () => {
      window.removeEventListener('sessionUpdate', handleSessionChange)
      window.removeEventListener('storage', handleSessionChange)
    }
  }, [])

  const isHomePageLoggedOut = pathname === "/" && isLoggedOut

  const links = [
    { title: "Home", icon: <IconHome size={20} strokeWidth={2.5} />, href: pathname === "/" ? "#" : "/" },
    { title: "About", icon: <IconInfoCircle size={20} strokeWidth={2.5} />, href: isHomePageLoggedOut ? "#about-section" : "/about" },
    { title: "Schedule", icon: <IconCalendarEvent size={20} strokeWidth={2.5} />, href: isHomePageLoggedOut ? "#schedule-section" : "/schedule" },
    { title: "Prizes", icon: <IconTrophy size={20} strokeWidth={2.5} />, href: "/prizes" },
    { title: "FAQ", icon: <IconCode size={20} strokeWidth={2.5} />, href: isHomePageLoggedOut ? "#register-section" : "/faq" },
    { title: "Contact", icon: <IconMail size={20} strokeWidth={2.5} />, href: "/contact" },
  ]

  return <FloatingDock items={links} />
}

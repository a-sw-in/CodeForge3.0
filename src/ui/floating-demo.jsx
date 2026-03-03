import { FloatingDock } from "./floating-dock"
import {
  IconHome,
  IconCalendarEvent,
  IconTrophy,
  IconInfoCircle,
  IconCode,
  IconMail,
} from "@tabler/icons-react"

export default function FloatingDockDemo() {
  const links = [
    { title: "Home", icon: <IconHome size={20} strokeWidth={2.5} />, href: "#" },
    { title: "About", icon: <IconInfoCircle size={20} strokeWidth={2.5} />, href: "#about-section" },
    { title: "Schedule", icon: <IconCalendarEvent size={20} strokeWidth={2.5} />, href: "#schedule" },
    { title: "Prizes", icon: <IconTrophy size={20} strokeWidth={2.5} />, href: "#prizes" },
    { title: "FAQ", icon: <IconCode size={20} strokeWidth={2.5} />, href: "#register-section" },
    { title: "Contact", icon: <IconMail size={20} strokeWidth={2.5} />, href: "#contact" },
  ]

  return <FloatingDock items={links} />
}

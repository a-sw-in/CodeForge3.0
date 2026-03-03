"use client"

import { cn } from "../lib/utils"
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion"
import { useRef, useState } from "react"

const COLORS = ['#CCFF00', '#00CCFF', '#FF44AA', '#CCFF00', '#00CCFF', '#FF44AA'];

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: shouldReduceMotion ? 0 : 0.3 }}
    >
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </motion.div>
  )
}

const FloatingDockMobile = ({ items, className }) => {
  return (
    <div className={cn("fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 block md:hidden", className)}>
      <div
        className="flex items-center gap-2 px-4 py-3 bg-white"
        style={{ border: '3px solid #001A6E', boxShadow: '4px 4px 0px #001A6E' }}
      >
        {items.map((item, i) => (
          <a key={item.title} href={item.href}
            className="flex h-9 w-9 items-center justify-center font-black text-xs"
            style={{
              background: COLORS[i % COLORS.length],
              border: '2px solid #001A6E',
              boxShadow: '2px 2px 0px #001A6E',
              color: '#001A6E',
            }}
            title={item.title}
          >
            <div className="h-5 w-5">{item.icon}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

const FloatingDockDesktop = ({ items, className }) => {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY)
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
      className={cn("fixed top-5 left-1/2 transform -translate-x-1/2 z-50 hidden md:flex items-center gap-2 px-5 py-3 bg-white", className)}
      style={{ border: '3px solid #001A6E', boxShadow: '4px 4px 0px #001A6E' }}
    >
      {/* Brand chip */}
      <div className="flex items-center pr-4 mr-1" style={{ borderRight: '2px solid #E2E8F0' }}>
        <div className="px-2 py-1 font-black text-sm" style={{ fontFamily: 'var(--y2k-font-display)', background: '#CCFF00', border: '2px solid #001A6E', color: '#001A6E' }}>
          CF 3.0
        </div>
      </div>
      {items.map((item, i) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} colorIndex={i} />
      ))}
    </motion.div>
  )
}

function IconContainer({ mouseX, title, icon, href, colorIndex }) {
  const ref = useRef(null)
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })
  const widthTransform = useTransform(distance, [-150, 0, 150], [34, 52, 34])
  const heightTransform = useTransform(distance, [-150, 0, 150], [34, 52, 34])
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [16, 26, 16])
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [16, 26, 16])
  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 })
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 })
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 })
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 })

  const [hovered, setHovered] = useState(false)
  const color = COLORS[colorIndex % COLORS.length];

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{ width, height, background: color, border: '2px solid #001A6E', boxShadow: hovered ? '3px 3px 0px #001A6E' : '2px 2px 0px #001A6E' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center"
        whileTap={{ x: 2, y: 2, boxShadow: '1px 1px 0px #001A6E' }}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 4, x: "-50%" }}
              className="absolute -top-9 left-1/2 w-fit px-2 py-1 text-xs font-black uppercase whitespace-pre"
              style={{ background: color, border: '2px solid #001A6E', boxShadow: '2px 2px 0px #001A6E', fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: widthIcon, height: heightIcon }} className="flex items-center justify-center text-[#001A6E]">
          {icon}
        </motion.div>
      </motion.div>
    </a>
  )
}

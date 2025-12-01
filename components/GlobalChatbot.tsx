"use client"

import { usePathname } from "next/navigation"
import WeddingChatbot from "./WeddingChatbot/WeddingChatbot"

/**
 * Global Chatbot Component
 * Renders the chatbot on all pages except the home landing page
 * Positioned unobtrusively next to the hamburger menu
 */
export default function GlobalChatbot() {
  const pathname = usePathname()
  
  // Don't show chatbot on home landing page
  if (pathname === "/") {
    return null
  }
  
  return <WeddingChatbot />
}


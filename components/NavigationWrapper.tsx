"use client"
import { usePathname } from "next/navigation"
import WeddingNavigation from "./WeddingNavigation"

export default function NavigationWrapper() {
  const pathname = usePathname()
  
  // Determine current page for navigation highlighting
  let currentPage = pathname
  if (pathname === "/rsvp" && typeof window !== "undefined") {
    // Check if it's edit mode by looking at URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("edit") === "true") {
      currentPage = "/rsvp?edit=true"
    }
  }
  
  return <WeddingNavigation currentPage={currentPage} />
}

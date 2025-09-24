import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"
import { Providers } from "./providers"
import ProfileMenu from "../components/ProfileMenu"
import WeddingChatbot from "../components/WeddingChatbot/WeddingChatbot"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Pia & Ryan Wedding 2026",
  description: "Join us as we celebrate the marriage of Pia Consuelo Weisenberger and Ryan Shisler - February 13, 2026",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {/* Profile Menu - Fixed in top right corner */}
          <div className="fixed top-4 right-4 z-50">
            <ProfileMenu />
          </div>
          
          {/* Wedding Chatbot */}
          <WeddingChatbot />
          
          {children}
        </Providers>
      </body>
    </html>
  )
}

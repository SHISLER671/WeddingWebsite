import type { Metadata } from "next"
import { Playfair_Display, Lato } from "next/font/google"
import type React from "react"
import "./globals.css"
import { Providers } from "./providers"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
})

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400", "700"],
})

export const metadata: Metadata = {
  title: "Pia & Ryan Wedding 2026",
  description: "Join us as we celebrate the marriage of Pia Consuelo Weisenberger and Ryan Shisler - February 13, 2026",
  generator: "v0.app",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

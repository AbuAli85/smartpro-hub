import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Oman Business Services Signup",
  description: "Register for business services in Oman",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex justify-end p-4 space-x-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'
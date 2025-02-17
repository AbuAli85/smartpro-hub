"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { IntlProvider } from "react-intl"
import { useEffect, useState } from "react"
import en from "@/locales/en.json"
import ar from "@/locales/ar.json"

const messages = {
  en,
  ar,
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [locale, setLocale] = useState("en")

  useEffect(() => {
    setMounted(true)
    const savedLocale = localStorage.getItem("locale") || "en"
    setLocale(savedLocale)
    document.documentElement.lang = savedLocale
    document.documentElement.dir = savedLocale === "ar" ? "rtl" : "ltr"
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <IntlProvider messages={messages[locale]} locale={locale} defaultLocale="en">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </IntlProvider>
  )
}


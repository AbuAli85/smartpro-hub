"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useIntl } from "react-intl"

export function LanguageToggle() {
  const router = useRouter()
  const intl = useIntl()

  const toggleLanguage = () => {
    const newLocale = intl.locale === "en" ? "ar" : "en"
    localStorage.setItem("locale", newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr"
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage}>
      {intl.locale === "en" ? "العربية" : "English"}
    </Button>
  )
}


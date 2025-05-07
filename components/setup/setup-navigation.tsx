"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const setupLinks = [
  { href: "/setup/deploy", label: "Deployment" },
  { href: "/setup/database", label: "Database" },
  { href: "/setup/supabase", label: "Supabase" },
  { href: "/debug/supabase", label: "Connection Test" },
]

export function SetupNavigation() {
  const pathname = usePathname()

  return (
    <div className="flex justify-center mb-8">
      <nav className="flex space-x-1 rounded-lg bg-muted p-1">
        {setupLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
              pathname === link.href
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

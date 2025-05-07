import type React from "react"
import { SetupNavigation } from "@/components/setup/setup-navigation"

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">SmartPRO Setup</h1>
        <p className="text-center text-muted-foreground mb-8">Configure your SmartPRO application</p>
        <SetupNavigation />
        {children}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// List of all shadcn/ui dependencies
const shadcnDependencies = [
  "@radix-ui/react-accordion",
  "@radix-ui/react-alert-dialog",
  "@radix-ui/react-aspect-ratio",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-menubar",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toast",
  "@radix-ui/react-toggle",
  "@radix-ui/react-toggle-group",
  "@radix-ui/react-tooltip",
  "cmdk",
  "date-fns",
  "react-day-picker",
  "react-hook-form",
  "react-resizable-panels",
  "sonner",
  "tailwindcss-animate",
  "vaul",
]

export default function CheckDependencies() {
  const [missingDependencies, setMissingDependencies] = useState<string[]>([])
  const [checking, setChecking] = useState(false)

  const checkDependencies = async () => {
    setChecking(true)
    const missing: string[] = []

    // This is a client-side check, so it's not 100% accurate
    // but it can help identify potential issues
    for (const dep of shadcnDependencies) {
      try {
        // Try to dynamically import the dependency
        await import(dep)
      } catch (error) {
        missing.push(dep)
      }
    }

    setMissingDependencies(missing)
    setChecking(false)
  }

  useEffect(() => {
    checkDependencies()
  }, [])

  const copyInstallCommand = () => {
    const command = `npm install ${missingDependencies.join(" ")}`
    navigator.clipboard.writeText(command)
    alert("Install command copied to clipboard!")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">shadcn/ui Dependency Checker</h1>

      <Button onClick={checkDependencies} disabled={checking}>
        {checking ? "Checking..." : "Check Dependencies"}
      </Button>

      {missingDependencies.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Missing Dependencies:</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <pre className="whitespace-pre-wrap">{missingDependencies.join("\n")}</pre>
          </div>

          <h3 className="text-lg font-semibold mt-4 mb-2">Installation Command:</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <pre className="whitespace-pre-wrap">npm install {missingDependencies.join(" ")}</pre>
          </div>

          <Button onClick={copyInstallCommand} className="mt-4">
            Copy Install Command
          </Button>
        </div>
      ) : checking ? (
        <p className="mt-4">Checking for missing dependencies...</p>
      ) : (
        <p className="mt-4">All dependencies are installed!</p>
      )}
    </div>
  )
}

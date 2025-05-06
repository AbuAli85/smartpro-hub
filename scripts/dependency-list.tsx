"use client"

import { useState } from "react"
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

export default function DependencyList() {
  const [copied, setCopied] = useState(false)

  const copyInstallCommand = () => {
    const command = `npm install ${shadcnDependencies.join(" ")}`
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">shadcn/ui Dependencies</h1>

      <p className="mb-4">
        Below is a list of all potential dependencies needed for shadcn/ui components. You can install them all at once,
        or just install the ones you need as you encounter errors.
      </p>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold mb-2">All Dependencies:</h2>
        <pre className="whitespace-pre-wrap text-sm">{shadcnDependencies.join("\n")}</pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Installation Command:</h2>
        <pre className="whitespace-pre-wrap text-sm overflow-x-auto">npm install {shadcnDependencies.join(" ")}</pre>
      </div>

      <Button onClick={copyInstallCommand} className="mt-2">
        {copied ? "Copied!" : "Copy Install Command"}
      </Button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Common Issues:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Missing dependencies:</strong> If you see errors like "Cannot find module '@radix-ui/react-*'", you
            need to install the specific package.
          </li>
          <li>
            <strong>Type errors:</strong> Make sure you have the latest versions of all packages.
          </li>
          <li>
            <strong>Build errors:</strong> Sometimes clearing the Next.js cache can help: <code>npx next clear</code>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Individual Installation Commands:</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          {shadcnDependencies.map((dep) => (
            <div key={dep} className="mb-2">
              <code className="text-sm">npm install {dep}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

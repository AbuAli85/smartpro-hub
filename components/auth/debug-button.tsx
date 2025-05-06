"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { clearSession } from "@/lib/auth/clear-session"
import { debugAuth } from "@/lib/auth/debug-auth"

export function DebugButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  const handleDebug = async () => {
    setIsLoading(true)
    const info = await debugAuth()
    setDebugInfo(info)
    setShowDebug(true)
    setIsLoading(false)
  }

  const handleClearSession = async () => {
    setIsLoading(true)
    await clearSession()
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={handleDebug} disabled={isLoading}>
          Debug Auth
        </Button>
        <Button variant="destructive" size="sm" onClick={handleClearSession} disabled={isLoading}>
          Clear Session
        </Button>
      </div>

      {showDebug && debugInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-bold mb-2">Auth Debug Info</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowDebug(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

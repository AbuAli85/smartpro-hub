"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SessionDebug() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)

  const checkSession = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error checking session:", error)
      }
      setSessionData(data)
    } catch (error) {
      console.error("Unexpected error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebug(!showDebug)}
        className="bg-white dark:bg-gray-800"
      >
        {showDebug ? "Hide" : "Show"} Session Debug
      </Button>

      {showDebug && (
        <Card className="absolute bottom-10 right-0 w-96 max-h-[80vh] overflow-auto">
          <CardHeader>
            <CardTitle className="text-sm">Session Debug</CardTitle>
            <Button size="sm" variant="ghost" onClick={checkSession} disabled={isLoading}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

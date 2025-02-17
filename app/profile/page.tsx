"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIntl } from "react-intl"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const intl = useIntl()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchProfile(session.user.email)
    }
  }, [status, session, router])

  const fetchProfile = async (email: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.from("user_profiles").select("*").eq("email", email).single()

    if (error) {
      console.error("Error fetching profile:", error)
    } else {
      setProfile(data)
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { error } = await supabase.from("user_profiles").update(profile).eq("id", profile.id)

    if (error) {
      console.error("Error updating profile:", error)
    } else {
      // Show success message
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <div>{intl.formatMessage({ id: "loading" })}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{intl.formatMessage({ id: "profile" })}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">{intl.formatMessage({ id: "name" })}</Label>
          <Input id="name" name="name" value={profile.name || ""} onChange={handleInputChange} />
        </div>
        {profile.user_type === "business" && (
          <>
            <div>
              <Label htmlFor="company_name">{intl.formatMessage({ id: "companyName" })}</Label>
              <Input
                id="company_name"
                name="company_name"
                value={profile.company_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="cr_number">{intl.formatMessage({ id: "crNumber" })}</Label>
              <Input id="cr_number" name="cr_number" value={profile.cr_number || ""} onChange={handleInputChange} />
            </div>
          </>
        )}
        {profile.user_type === "freelancer" && (
          <>
            <div>
              <Label htmlFor="skillset">{intl.formatMessage({ id: "skillset" })}</Label>
              <Input id="skillset" name="skillset" value={profile.skillset || ""} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="portfolio_link">{intl.formatMessage({ id: "portfolioLink" })}</Label>
              <Input
                id="portfolio_link"
                name="portfolio_link"
                value={profile.portfolio_link || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}
        <div>
          <Label htmlFor="phone_number">{intl.formatMessage({ id: "phoneNumber" })}</Label>
          <Input
            id="phone_number"
            name="phone_number"
            value={profile.phone_number || ""}
            onChange={handleInputChange}
          />
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? intl.formatMessage({ id: "saving" }) : intl.formatMessage({ id: "saveChanges" })}
        </Button>
      </form>
    </div>
  )
}


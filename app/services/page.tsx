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

export default function ServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const intl = useIntl()
  const [services, setServices] = useState<any[]>([])
  const [newService, setNewService] = useState({ name: "", description: "", price: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchServices(session.user.email)
    }
  }, [status, session, router])

  const fetchServices = async (email: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.from("services").select("*").eq("user_email", email)

    if (error) {
      console.error("Error fetching services:", error)
    } else {
      setServices(data || [])
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewService({ ...newService, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { data, error } = await supabase.from("services").insert({ ...newService, user_email: session?.user?.email })

    if (error) {
      console.error("Error adding service:", error)
    } else {
      setServices([...services, data[0]])
      setNewService({ name: "", description: "", price: "" })
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return <div>{intl.formatMessage({ id: "loading" })}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{intl.formatMessage({ id: "services" })}</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{intl.formatMessage({ id: "addNewService" })}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{intl.formatMessage({ id: "serviceName" })}</Label>
            <Input id="name" name="name" value={newService.name} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="description">{intl.formatMessage({ id: "serviceDescription" })}</Label>
            <Input
              id="description"
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">{intl.formatMessage({ id: "servicePrice" })}</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={newService.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? intl.formatMessage({ id: "adding" }) : intl.formatMessage({ id: "addService" })}
          </Button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">{intl.formatMessage({ id: "yourServices" })}</h2>
        {services.length === 0 ? (
          <p>{intl.formatMessage({ id: "noServices" })}</p>
        ) : (
          <ul className="space-y-2">
            {services.map((service) => (
              <li key={service.id} className="border p-2 rounded">
                <h3 className="font-semibold">{service.name}</h3>
                <p>{service.description}</p>
                <p>
                  {intl.formatMessage({ id: "price" })}: {service.price}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


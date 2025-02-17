"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useIntl } from "react-intl"

const profileSchema = z.object({
  businessLicense: z.string().optional(),
  taxDetails: z.string().optional(),
  servicesOffered: z.string(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfileSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const intl = useIntl()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        throw new Error("Profile setup failed")
      }
    } catch (error) {
      console.error("Profile setup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {intl.formatMessage({ id: "setupYourProfile" })}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="businessLicense">{intl.formatMessage({ id: "businessLicense" })}</Label>
            <Input id="businessLicense" {...register("businessLicense")} />
            {errors.businessLicense && <p className="mt-1 text-sm text-red-500">{errors.businessLicense.message}</p>}
          </div>
          <div>
            <Label htmlFor="taxDetails">{intl.formatMessage({ id: "taxDetails" })}</Label>
            <Input id="taxDetails" {...register("taxDetails")} />
            {errors.taxDetails && <p className="mt-1 text-sm text-red-500">{errors.taxDetails.message}</p>}
          </div>
          <div>
            <Label htmlFor="servicesOffered">{intl.formatMessage({ id: "servicesOffered" })}</Label>
            <Input id="servicesOffered" {...register("servicesOffered")} required />
            {errors.servicesOffered && <p className="mt-1 text-sm text-red-500">{errors.servicesOffered.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? intl.formatMessage({ id: "saving" }) : intl.formatMessage({ id: "saveProfile" })}
          </Button>
        </form>
      </div>
    </div>
  )
}


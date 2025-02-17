"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useIntl } from "react-intl"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const signupSchema = z
  .object({
    userType: z.enum(["business", "freelancer", "individual"]),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message: "Password must contain uppercase, lowercase, number, and special character",
      }),
    confirmPassword: z.string(),
    crNumber: z.string().optional(),
    companyName: z.string().optional(),
    industry: z.string().optional(),
    idCardNumber: z.string().optional(),
    skillset: z.string().optional(),
    portfolioLink: z.string().url().optional(),
    phoneNumber: z.string().regex(/^(?:\+968)?\d{8}$/, {
      message: "Invalid Omani phone number",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.userType === "business") {
        return !!data.crNumber && !!data.companyName && !!data.industry
      }
      if (data.userType === "freelancer") {
        return !!data.idCardNumber && !!data.skillset && !!data.portfolioLink
      }
      return true
    },
    {
      message: "Please fill in all required fields",
    },
  )

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const intl = useIntl()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const userType = watch("userType")

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push("/profile-setup")
      } else {
        throw new Error("Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/profile-setup" })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="userType">{intl.formatMessage({ id: "userType" })}</Label>
        <Select onValueChange={(value) => register("userType").onChange({ target: { value } })}>
          <SelectTrigger>
            <SelectValue placeholder={intl.formatMessage({ id: "selectUserType" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="business">{intl.formatMessage({ id: "business" })}</SelectItem>
            <SelectItem value="freelancer">{intl.formatMessage({ id: "freelancer" })}</SelectItem>
            <SelectItem value="individual">{intl.formatMessage({ id: "individual" })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {userType === "business" && (
        <>
          <div>
            <Label htmlFor="crNumber">{intl.formatMessage({ id: "crNumber" })}</Label>
            <Input id="crNumber" {...register("crNumber")} />
            {errors.crNumber && <p className="mt-1 text-sm text-red-500">{errors.crNumber.message}</p>}
          </div>
          <div>
            <Label htmlFor="companyName">{intl.formatMessage({ id: "companyName" })}</Label>
            <Input id="companyName" {...register("companyName")} />
            {errors.companyName && <p className="mt-1 text-sm text-red-500">{errors.companyName.message}</p>}
          </div>
          <div>
            <Label htmlFor="industry">{intl.formatMessage({ id: "industry" })}</Label>
            <Input id="industry" {...register("industry")} />
            {errors.industry && <p className="mt-1 text-sm text-red-500">{errors.industry.message}</p>}
          </div>
        </>
      )}

      {userType === "freelancer" && (
        <>
          <div>
            <Label htmlFor="idCardNumber">{intl.formatMessage({ id: "idCardNumber" })}</Label>
            <Input id="idCardNumber" {...register("idCardNumber")} />
            {errors.idCardNumber && <p className="mt-1 text-sm text-red-500">{errors.idCardNumber.message}</p>}
          </div>
          <div>
            <Label htmlFor="skillset">{intl.formatMessage({ id: "skillset" })}</Label>
            <Input id="skillset" {...register("skillset")} />
            {errors.skillset && <p className="mt-1 text-sm text-red-500">{errors.skillset.message}</p>}
          </div>
          <div>
            <Label htmlFor="portfolioLink">{intl.formatMessage({ id: "portfolioLink" })}</Label>
            <Input id="portfolioLink" {...register("portfolioLink")} />
            {errors.portfolioLink && <p className="mt-1 text-sm text-red-500">{errors.portfolioLink.message}</p>}
          </div>
        </>
      )}

      <div>
        <Label htmlFor="email">{intl.formatMessage({ id: "email" })}</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">{intl.formatMessage({ id: "password" })}</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">{intl.formatMessage({ id: "confirmPassword" })}</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <div>
        <Label htmlFor="phoneNumber">{intl.formatMessage({ id: "phoneNumber" })}</Label>
        <Input id="phoneNumber" {...register("phoneNumber")} />
        {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        {intl.formatMessage({ id: "signUp" })}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {intl.formatMessage({ id: "orContinueWith" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => handleSocialSignIn("google")}>
          <Icons.google className="mr-2 h-4 w-4" /> Google
        </Button>
        <Button variant="outline" onClick={() => handleSocialSignIn("linkedin")}>
          <Icons.linkedin className="mr-2 h-4 w-4" /> LinkedIn
        </Button>
      </div>
    </form>
  )
}


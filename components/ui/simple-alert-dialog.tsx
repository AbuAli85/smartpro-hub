"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimpleAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const SimpleAlertDialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

export function SimpleAlertDialog({ open, onOpenChange, children }: SimpleAlertDialogProps) {
  return (
    <SimpleAlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
          <div className="z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">{children}</div>
        </div>
      )}
    </SimpleAlertDialogContext.Provider>
  )
}

export function SimpleAlertDialogTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(SimpleAlertDialogContext)
  return (
    <Button {...props} onClick={() => onOpenChange(true)}>
      {children}
    </Button>
  )
}

export function SimpleAlertDialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = React.useContext(SimpleAlertDialogContext)
  if (!open) return null
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      {children}
    </div>
  )
}

export function SimpleAlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-center", className)} {...props} />
}

export function SimpleAlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-2 mt-4", className)} {...props} />
}

export function SimpleAlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

export function SimpleAlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
}

export function SimpleAlertDialogAction({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(SimpleAlertDialogContext)
  return (
    <Button
      {...props}
      className={cn(className)}
      onClick={(e) => {
        props.onClick?.(e)
        onOpenChange(false)
      }}
    >
      {children}
    </Button>
  )
}

export function SimpleAlertDialogCancel({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(SimpleAlertDialogContext)
  return (
    <Button
      variant="outline"
      {...props}
      className={cn(className)}
      onClick={(e) => {
        props.onClick?.(e)
        onOpenChange(false)
      }}
    >
      {children || "Cancel"}
    </Button>
  )
}

"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleAccordionProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  defaultValue?: string | string[]
  className?: string
  children: React.ReactNode
}

interface SimpleAccordionContextProps {
  open: string[]
  toggle: (value: string) => void
  type: "single" | "multiple"
  collapsible: boolean
}

const SimpleAccordionContext = React.createContext<SimpleAccordionContextProps>({
  open: [],
  toggle: () => {},
  type: "single",
  collapsible: true,
})

export function SimpleAccordion({
  type = "single",
  collapsible = true,
  defaultValue = [],
  className,
  children,
}: SimpleAccordionProps) {
  const [open, setOpen] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : [],
  )

  const toggle = React.useCallback(
    (value: string) => {
      if (type === "single") {
        if (collapsible && open.includes(value)) {
          setOpen([])
        } else {
          setOpen([value])
        }
      } else {
        if (open.includes(value)) {
          setOpen(open.filter((item) => item !== value))
        } else {
          setOpen([...open, value])
        }
      }
    },
    [type, collapsible, open],
  )

  return (
    <SimpleAccordionContext.Provider value={{ open, toggle, type, collapsible }}>
      <div className={cn("space-y-1", className)}>{children}</div>
    </SimpleAccordionContext.Provider>
  )
}

interface SimpleAccordionItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function SimpleAccordionItem({ value, className, children }: SimpleAccordionItemProps) {
  return (
    <div className={cn("border rounded-md", className)} data-value={value}>
      {children}
    </div>
  )
}

interface SimpleAccordionTriggerProps {
  className?: string
  children: React.ReactNode
}

export function SimpleAccordionTrigger({ className, children }: SimpleAccordionTriggerProps) {
  const { open, toggle } = React.useContext(SimpleAccordionContext)
  const itemRef = React.useRef<HTMLDivElement>(null)

  const value = itemRef.current?.parentElement?.getAttribute("data-value") || ""
  const isOpen = open.includes(value)

  return (
    <div
      ref={itemRef}
      className={cn(
        "flex items-center justify-between px-4 py-2 font-medium transition-all hover:underline",
        className,
      )}
      onClick={() => value && toggle(value)}
    >
      {children}
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 transition-transform duration-200", {
          "transform rotate-180": isOpen,
        })}
      />
    </div>
  )
}

interface SimpleAccordionContentProps {
  className?: string
  children: React.ReactNode
}

export function SimpleAccordionContent({ className, children }: SimpleAccordionContentProps) {
  const { open } = React.useContext(SimpleAccordionContext)
  const itemRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const value = itemRef.current?.parentElement?.getAttribute("data-value") || ""
  const isOpen = open.includes(value)

  return (
    <div ref={itemRef} className="overflow-hidden">
      <div
        ref={contentRef}
        className={cn("overflow-hidden transition-all", {
          "max-h-0": !isOpen,
          "max-h-[1000px]": isOpen,
        })}
      >
        <div className={cn("pb-4 pt-0 px-4", className)}>{children}</div>
      </div>
    </div>
  )
}

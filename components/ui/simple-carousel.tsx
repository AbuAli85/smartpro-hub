"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SimpleCarouselContext = React.createContext<{
  currentIndex: number
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
  totalSlides: number
  next: () => void
  prev: () => void
}>({
  currentIndex: 0,
  setCurrentIndex: () => {},
  totalSlides: 0,
  next: () => {},
  prev: () => {},
})

interface SimpleCarouselProps {
  children: React.ReactNode
  className?: string
  opts?: {
    loop?: boolean
  }
}

function SimpleCarousel({ children, className, opts = {} }: SimpleCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const childrenArray = React.Children.toArray(children)
  const totalSlides = childrenArray.length
  const { loop = true } = opts

  const next = React.useCallback(() => {
    if (currentIndex === totalSlides - 1) {
      if (loop) {
        setCurrentIndex(0)
      }
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, totalSlides, loop])

  const prev = React.useCallback(() => {
    if (currentIndex === 0) {
      if (loop) {
        setCurrentIndex(totalSlides - 1)
      }
    } else {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex, totalSlides, loop])

  return (
    <SimpleCarouselContext.Provider
      value={{
        currentIndex,
        setCurrentIndex,
        totalSlides,
        next,
        prev,
      }}
    >
      <div className={cn("relative", className)}>{children}</div>
    </SimpleCarouselContext.Provider>
  )
}

function SimpleCarouselContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  const { currentIndex } = React.useContext(SimpleCarouselContext)
  const childrenArray = React.Children.toArray(children)

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {React.Children.map(childrenArray, (child) => (
          <div className="min-w-full flex-shrink-0">{child}</div>
        ))}
      </div>
    </div>
  )
}

function SimpleCarouselItem({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-full", className)}>{children}</div>
}

function SimpleCarouselPrevious({ className }: React.ComponentProps<typeof Button>) {
  const { prev } = React.useContext(SimpleCarouselContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("absolute left-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full", className)}
      onClick={prev}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function SimpleCarouselNext({ className }: React.ComponentProps<typeof Button>) {
  const { next } = React.useContext(SimpleCarouselContext)

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("absolute right-3 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full", className)}
      onClick={next}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

function SimpleCarouselDots({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { currentIndex, setCurrentIndex, totalSlides } = React.useContext(SimpleCarouselContext)

  return (
    <div className={cn("flex justify-center gap-1 mt-4", className)}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <Button
          key={index}
          variant="outline"
          size="icon"
          className={cn("h-2 w-2 rounded-full p-0", currentIndex === index ? "bg-primary" : "bg-muted")}
          onClick={() => setCurrentIndex(index)}
        >
          <span className="sr-only">{`Go to slide ${index + 1}`}</span>
        </Button>
      ))}
    </div>
  )
}

export {
  SimpleCarousel,
  SimpleCarouselContent,
  SimpleCarouselItem,
  SimpleCarouselPrevious,
  SimpleCarouselNext,
  SimpleCarouselDots,
}

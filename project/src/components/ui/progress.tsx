import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    indicatorColor?: string
  }
>(({ className, value, max = 100, indicatorColor, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ 
          width: value ? `${Math.min(Math.max(value, 0), max) / max * 100}%` : "0%",
          backgroundColor: indicatorColor,
        }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
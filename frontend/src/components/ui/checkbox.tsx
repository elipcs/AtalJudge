import * as React from "react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  indeterminate?: boolean
  variant?: "default" | "danger" | "warning" | "success" | "blue" | "text"
  size?: "sm" | "md" | "lg"
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, variant = "default", size = "md", ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = !!indeterminate
      }
    }, [indeterminate])

    const boxSize = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    }[size]

    const iconSize = {
      sm: "h-3 w-3",
      md: "h-3.5 w-3.5",
      lg: "h-4 w-4",
    }[size]

    const color = {
      default: {
        ring: "ring-blue-500",
        border: "border-slate-300",
        bgChecked: "bg-blue-600",
      },
      danger: {
        ring: "ring-slate-700",
        border: "border-slate-300",
        bgChecked: "bg-slate-800",
      },
      warning: {
        ring: "ring-yellow-500",
        border: "border-slate-300",
        bgChecked: "bg-yellow-500",
      },
      success: {
        ring: "ring-green-500",
        border: "border-slate-300",
        bgChecked: "bg-green-600",
      },
      blue: {
        ring: "ring-blue-500",
        border: "border-slate-300",
        bgChecked: "bg-blue-600",
      },
      text: {
        ring: "ring-slate-400",
        border: "border-slate-300",
        bgChecked: "bg-slate-700",
      },
    }[variant]

    return (
      <span
        className={cn("relative inline-flex items-center cursor-pointer", className)}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName.toLowerCase() !== "input") {
            internalRef.current?.click()
          }
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault()
            internalRef.current?.click()
          }
        }}
        role="checkbox"
        aria-checked={props.checked}
        tabIndex={0}
      >
        <input
          type="checkbox"
          ref={(node) => {
            internalRef.current = node
            if (typeof ref === "function") ref(node)
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
          }}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-md transition-all",
            "border bg-white shadow-sm",
            color.border,
            boxSize,
            "peer-focus-visible:outline-none peer-focus-visible:ring-2",
            color.ring,
            "ring-offset-2 ring-offset-background",
            "peer-checked:border-transparent peer-checked:shadow peer-checked:text-white",
            variant === "danger" && "peer-checked:bg-slate-800",
            variant === "default" && "peer-checked:bg-blue-600", 
            variant === "warning" && "peer-checked:bg-yellow-500",
            variant === "success" && "peer-checked:bg-green-600",
            variant === "blue" && "peer-checked:bg-blue-600",
            variant === "text" && "peer-checked:bg-slate-700",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
          )}
        >
          {}
          {indeterminate ? (
            <svg className={cn(iconSize, "text-slate-500 peer-checked:text-white")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" d="M6 12h12" />
            </svg>
          ) : (
            <svg className={cn(iconSize, "opacity-0 peer-checked:opacity-100 text-white transition-opacity")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </span>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

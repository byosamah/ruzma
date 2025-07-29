import * as React from "react"

import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
  id?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    return (
      <button
        type="button"
        onClick={() => onCheckedChange?.(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-10 items-center rounded-full bg-black transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "transform-none min-h-0", // Override global button styles
          className
        )}
        style={{ transform: 'none', minHeight: 'unset' }}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
            checked 
              ? "translate-x-5 rtl:-translate-x-5" 
              : "translate-x-1 rtl:-translate-x-1"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }

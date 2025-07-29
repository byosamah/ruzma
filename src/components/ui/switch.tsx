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
          "relative inline-flex h-8 w-[60px] items-center rounded-full bg-black transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-7 w-7 transform rounded-full bg-white transition-transform duration-200",
            checked 
              ? "translate-x-[30px] rtl:-translate-x-[30px]" 
              : "translate-x-[2px] rtl:-translate-x-[2px]"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }

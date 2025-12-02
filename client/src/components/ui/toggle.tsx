import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, onPressedChange, onClick, ...props }, ref) => (
    <button
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-1.5",
        pressed ? "bg-accent text-accent-foreground" : "",
        className
      )}
      onClick={(e) => {
        // Call consumer's onClick
        onClick?.(e)
        // Notify pressed state change if handler provided and pressed is controlled
        if (typeof pressed === "boolean") {
          onPressedChange?.(!pressed)
        }
      }}
      {...props}
    />
  )
)
Toggle.displayName = "Toggle"

export { Toggle }

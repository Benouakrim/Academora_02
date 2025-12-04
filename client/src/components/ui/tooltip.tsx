import * as React from "react"
import { cn } from "@/lib/utils"

type TooltipContextValue = {
  open: boolean
  setOpen: (o: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ 
  open, 
  onOpenChange, 
  children 
}: { 
  open?: boolean
  onOpenChange?: (o: boolean) => void
  children?: React.ReactNode 
}) {
  const [internal, setInternal] = React.useState(false)
  const isControlled = open !== undefined
  const current = isControlled ? open : internal

  const setOpen = (o: boolean) => {
    if (!isControlled) setInternal(o)
    onOpenChange?.(o)
  }

  const ctx: TooltipContextValue = { open: current, setOpen }
  return <TooltipContext.Provider value={ctx}>{children}</TooltipContext.Provider>
}

export function TooltipTrigger({ 
  asChild, 
  children, 
  className 
}: { 
  asChild?: boolean
  children?: React.ReactNode
  className?: string 
}) {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error('TooltipTrigger must be used within Tooltip')

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: () => ctx.setOpen(true),
      onMouseLeave: () => ctx.setOpen(false),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  return (
    <div 
      onMouseEnter={() => ctx.setOpen(true)}
      onMouseLeave={() => ctx.setOpen(false)}
      className={cn(className)}
    >
      {children}
    </div>
  )
}

export function TooltipContent({ 
  side = 'top', 
  className, 
  children 
}: { 
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  children?: React.ReactNode 
}) {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error('TooltipContent must be used within Tooltip')
  if (!ctx.open) return null

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div 
      className={cn(
        'absolute z-50 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap',
        sideClasses[side],
        className
      )}
    >
      {children}
      <div className={cn(
        'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45',
        side === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
        side === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
        side === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
        side === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
      )} />
    </div>
  )
}

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

type SheetContextValue = {
  open: boolean
  setOpen: (o: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

export function Sheet({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (o: boolean) => void; children?: React.ReactNode }) {
  const [internal, setInternal] = React.useState(false)
  const isControlled = open !== undefined
  const current = isControlled ? open : internal

  const setOpen = (o: boolean) => {
    if (!isControlled) setInternal(o)
    onOpenChange?.(o)
  }

  const ctx: SheetContextValue = { open: current, setOpen }
  return <SheetContext.Provider value={ctx}>{children}</SheetContext.Provider>
}

export function SheetTrigger({ asChild, children, className }: { asChild?: boolean; children?: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error('SheetTrigger must be used within Sheet')

  if (asChild && React.isValidElement(children)) {
    const originalOnClick = children.props.onClick
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      ctx.setOpen(true)
      // Call the original onClick if it exists
      if (typeof originalOnClick === 'function') {
        originalOnClick(e)
      }
    }
    return React.cloneElement(children, {
      onClick: handleClick,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  return (
    <button type="button" onClick={() => ctx.setOpen(true)} className={className}>
      {children}
    </button>
  )
}

export function SheetContent({ side = 'right', className, children }: { side?: 'left' | 'right' | 'top' | 'bottom'; className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error('SheetContent must be used within Sheet')
  if (!ctx.open) return null

  const sideClasses = {
    left: 'inset-y-0 left-0 w-3/4 max-w-sm border-r',
    right: 'inset-y-0 right-0 w-3/4 max-w-sm border-l',
    top: 'inset-x-0 top-0 h-auto border-b',
    bottom: 'inset-x-0 bottom-0 h-auto border-t',
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => ctx.setOpen(false)} />
      <div className={cn('fixed z-50 bg-background p-6 shadow-lg', sideClasses[side], className)}>
        <button
          type="button"
          onClick={() => ctx.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  )
}

export function SheetHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>{children}</div>
}

export function SheetTitle({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
}

export function SheetDescription({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

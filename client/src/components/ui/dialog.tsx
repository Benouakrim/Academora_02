import * as React from 'react'
import { cn } from '@/lib/utils'

type DialogContextValue = { open: boolean; setOpen: (o: boolean) => void }
const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (o: boolean) => void; children?: React.ReactNode }) {
  const [internal, setInternal] = React.useState(false)
  const isControlled = open !== undefined
  const current = isControlled ? open : internal
  const setOpen = (o: boolean) => {
    if (!isControlled) setInternal(o)
    onOpenChange?.(o)
  }
  return <DialogContext.Provider value={{ open: current, setOpen }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children?: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('DialogTrigger must be used within Dialog')
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick: () => ctx.setOpen(true) } as any)
  }
  return <button onClick={() => ctx.setOpen(true)}>{children}</button>
}

export function DialogContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('DialogContent must be used within Dialog')
  if (!ctx.open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => ctx.setOpen(false)} />
      <div className={cn('fixed z-50 left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg', className)}>
        {children}
      </div>
    </>
  )
}

export function DialogHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>{children}</div>
}
export function DialogTitle({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
}
export function DialogDescription({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}
export function DialogFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2', className)}>{children}</div>
}

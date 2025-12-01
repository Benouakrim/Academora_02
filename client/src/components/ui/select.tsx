import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

type SelectContextValue = {
  value: string
  setValue: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string
  onValueChange?: (v: string) => void
  children?: React.ReactNode
}) {
  const [internal, setInternal] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const setValue = (v: string) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
    setOpen(false)
  }

  const ctx: SelectContextValue = { value: current, setValue, open, setOpen }
  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
}

export function SelectTrigger({ className, children, placeholder }: { className?: string; children?: React.ReactNode; placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('SelectTrigger must be used within Select')
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <span className="block truncate">{children || placeholder || 'Select...'}</span>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('SelectValue must be used within Select')
  return <>{ctx.value || placeholder}</>
}

export function SelectContent({ children }: { children?: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('SelectContent must be used within Select')
  if (!ctx.open) return null
  return (
    <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1">
      <div className="p-1">{children}</div>
    </div>
  )
}

export function SelectItem({ value, children }: { value: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('SelectItem must be used within Select')
  const isSelected = ctx.value === value
  return (
    <div
      onClick={() => ctx.setValue(value)}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </div>
  )
}

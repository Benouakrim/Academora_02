import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle } from 'lucide-react'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (url: string, openInNewTab?: boolean) => void
  initialUrl?: string
}

export default function LinkDialog({ open, onOpenChange, onInsert, initialUrl = '' }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [openInNewTab, setOpenInNewTab] = useState(true)
  const [error, setError] = useState('')

  const handleInsert = () => {
    setError('')

    if (!url) {
      setError('Please enter a URL')
      return
    }

    // Validate URL
    try {
      // Add protocol if missing
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`
      
      new URL(urlWithProtocol)
      onInsert(urlWithProtocol, openInNewTab)
      resetForm()
      onOpenChange(false)
    } catch {
      setError('Please enter a valid URL')
    }
  }

  const handleRemove = () => {
    onInsert('', false) // Empty URL removes the link
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setUrl('')
    setOpenInNewTab(true)
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      else setUrl(initialUrl)
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialUrl ? 'Edit Link' : 'Insert Link'}</DialogTitle>
          <DialogDescription>
            Enter the URL you want to link to
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              You can paste the full URL including http:// or https://
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="new-tab" 
              checked={openInNewTab} 
              onCheckedChange={(checked) => setOpenInNewTab(checked as boolean)}
            />
            <label
              htmlFor="new-tab"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Open in new tab
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {initialUrl && (
            <Button variant="destructive" onClick={handleRemove} className="sm:mr-auto">
              Remove Link
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>
            {initialUrl ? 'Update' : 'Insert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

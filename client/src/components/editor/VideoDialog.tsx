import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Video } from 'lucide-react'

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (url: string) => void
}

export default function VideoDialog({ open, onOpenChange, onInsert }: VideoDialogProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  const handleInsert = () => {
    setError('')

    if (!url) {
      setError('Please enter a YouTube URL')
      return
    }

    const videoId = extractYoutubeId(url)

    if (!videoId) {
      setError('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)')
      return
    }

    // Insert using the full URL format that Tiptap YouTube extension expects
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    onInsert(youtubeUrl)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setUrl('')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Embed YouTube Video
          </DialogTitle>
          <DialogDescription>
            Paste a YouTube video URL to embed it in your article
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="video-url">YouTube URL</Label>
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Supported formats:
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
              <li>https://www.youtube.com/embed/VIDEO_ID</li>
            </ul>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>
            Embed Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

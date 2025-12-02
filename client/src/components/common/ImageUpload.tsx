import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type Props = {
  value?: string | null
  onChange: (url: string) => void
  className?: string
}

export default function ImageUpload({ value, onChange, className }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await api.post<{ url: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onChange(data.url)
      toast.success("Image uploaded")
    } catch (err) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      
      {value ? (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted group">
          <img src={value} alt="Uploaded content" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="destructive" size="sm" onClick={handleRemove}>
              <X className="h-4 w-4 mr-2" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="p-3 bg-muted rounded-full mb-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Click to upload cover image</p>
              <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

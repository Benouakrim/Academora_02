import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (url: string, alt?: string) => void
}

export default function ImageUploadDialog({ open, onOpenChange, onInsert }: ImageUploadDialogProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError('')
    
    if (!selectedFile) return

    // Validation
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload/image', formData)

      const uploadedUrl = response.data.url
      onInsert(uploadedUrl, altText || file.name)
      resetForm()
      onOpenChange(false)
      toast.success('Image uploaded successfully')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const message = error.response?.data?.message || 'Failed to upload image'
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlInsert = () => {
    if (!imageUrl) {
      setError('Please enter an image URL')
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
      onInsert(imageUrl, altText || 'Image')
      resetForm()
      onOpenChange(false)
      toast.success('Image inserted')
    } catch {
      setError('Please enter a valid URL')
    }
  }

  const resetForm = () => {
    setImageUrl('')
    setAltText('')
    setFile(null)
    setPreview('')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image or paste a URL. Maximum file size: 5MB
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Select Image</Label>
                <Input
                  id="file"
                  type="file"
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>

              {preview && (
                <div className="rounded-lg border p-4 bg-muted/30">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-md object-contain"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="alt-upload">Alt Text (Optional)</Label>
                <Input
                  id="alt-upload"
                  placeholder="Describe the image for accessibility"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  disabled={uploading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload & Insert'}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlInsert()}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="alt-url">Alt Text (Optional)</Label>
                <Input
                  id="alt-url"
                  placeholder="Describe the image for accessibility"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
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
              <Button onClick={handleUrlInsert}>Insert</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

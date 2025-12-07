import { useState, useRef } from 'react'
import { X, Loader2, Image as ImageIcon, Upload, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type Props = {
  value?: string | null
  onChange: (url: string, publicId?: string) => void
  className?: string
  allowUrl?: boolean // Allow external URL input
  maxSizeMB?: number
  type?: 'image' | 'video' // Type of media
}

export default function ImageUpload({ 
  value, 
  onChange, 
  className,
  allowUrl = true,
  maxSizeMB = 5,
  type = 'image'
}: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [externalUrl, setExternalUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file type
    const isCorrectType = type === 'image' 
      ? file.type.startsWith('image/')
      : file.type.startsWith('video/');
    
    if (!isCorrectType) {
      toast.error(`Please select a valid ${type} file`)
      return false
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const endpoint = type === 'image' ? '/upload/image' : '/upload/video'
      const { data } = await api.post<{ 
        url?: string
        imageUrl?: string
        videoUrl?: string
        publicId?: string 
      }>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const mediaUrl = data.imageUrl || data.videoUrl || data.url
      if (!mediaUrl) {
        throw new Error('No URL returned from server')
      }
      
      onChange(mediaUrl, data.publicId)
      toast.success(`${type} uploaded successfully`)
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || `Failed to upload ${type}`
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleUrlSubmit = async () => {
    if (!externalUrl) {
      toast.error(`Please enter a ${type} URL`)
      return
    }

    // Basic URL validation
    try {
      new URL(externalUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsUploading(true)
    try {
      const endpoint = type === 'image' ? '/upload/image' : '/upload/video'
      const { data } = await api.post<{ 
        url?: string
        imageUrl?: string
        videoUrl?: string
        publicId?: string 
      }>(endpoint, { url: externalUrl })
      
      const mediaUrl = data.imageUrl || data.videoUrl || data.url
      if (!mediaUrl) {
        throw new Error('No URL returned from server')
      }
      
      onChange(mediaUrl, data.publicId)
      toast.success(`${type} added successfully`)
      setExternalUrl('')
      setShowUrlInput(false)
    } catch (error) {
      console.error('URL submission error:', error)
      toast.error(`Failed to add ${type} URL`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={className}>
      {value ? (
        // Display current media
        <div className="relative inline-block">
          {type === 'image' ? (
            <img 
              src={value} 
              alt="Preview" 
              className="max-w-xs max-h-64 rounded-lg object-cover"
            />
          ) : (
            <video 
              src={value} 
              controls
              className="max-w-xs max-h-64 rounded-lg"
            />
          )}
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={handleUpload}
            accept={type === 'image' ? 'image/*' : 'video/*'}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          ) : (
            <>
              {type === 'image' ? (
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              ) : (
                <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              )}
              <p className="text-sm text-gray-700 mb-1">
                Drag & drop {type} here or{' '}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">Max {maxSizeMB}MB</p>
              
              {allowUrl && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="flex items-center justify-center gap-2 mx-auto text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      <Link className="w-4 h-4" />
                      Or use {type} URL
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <input
                        type="url"
                        placeholder={`Enter ${type} URL...`}
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                        disabled={isUploading}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUrlSubmit}
                          disabled={isUploading}
                          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded disabled:opacity-50"
                        >
                          Add URL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUrlInput(false)
                            setExternalUrl('')
                          }}
                          className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

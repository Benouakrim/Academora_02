import { useArticleEditor } from '@/hooks/useArticleEditor'
import { EditorContent } from '@tiptap/react'
import EditorToolbar from './EditorToolbar'
import EditorBubbleMenu from './EditorBubbleMenu'
import { Clock, FileText, BookOpen } from 'lucide-react'
import '@/styles/editor.css'

type Props = {
  content: string
  onChange: (html: string) => void
  editable?: boolean
  placeholder?: string
  mode?: 'admin' | 'user'
  showStats?: boolean
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  editable = true, 
  placeholder,
  mode = 'user',
  showStats = false
}: Props) {
  const { editor, isReady, stats } = useArticleEditor({
    content,
    onChange,
    editable,
    placeholder,
    mode
  })

  if (!editor) {
    return (
      <div className="border rounded-xl overflow-hidden bg-card shadow-sm flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col h-full animate-fadeIn">
      {editable && (
        <>
          <EditorToolbar editor={editor} />
          <EditorBubbleMenu editor={editor} />
        </>
      )}
      
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Stats Footer */}
      {showStats && stats && isReady && (
        <div className="border-t bg-muted/20 px-6 py-3 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span>{stats.words} words</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{stats.characters} characters</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{stats.readingTime} min read</span>
          </div>
        </div>
      )}
    </div>
  )
}

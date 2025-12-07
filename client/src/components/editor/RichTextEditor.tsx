import { useEffect, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { Clock, FileText, BookOpen } from 'lucide-react'
import { useArticleEditor } from '@/hooks/useArticleEditor'
import EditorToolbar from './EditorToolbar'
import EditorBubbleMenu from './EditorBubbleMenu'
import BlockLibraryMenu from '@/cms/menus/BlockLibraryMenu'
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
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  const { editor, isReady, stats } = useArticleEditor({
    content,
    onChange,
    editable,
    placeholder,
    mode
  })

  // Slash command to open the block library
  useEffect(() => {
    if (!editor) return

    const handleUpdate = ({ editor: ed }: { editor: typeof editor }) => {
      const { state, view } = ed
      const { selection } = state
      const from = selection.from
      const textBefore = state.doc.textBetween(Math.max(0, from - 10), from, '\n', '\n')

      if (textBefore.endsWith('/') && !showBlockMenu) {
        const coords = view.coordsAtPos(from)
        setMenuPosition({
          top: coords.top + window.scrollY + 20,
          left: coords.left + window.scrollX,
        })
        setShowBlockMenu(true)

        // Remove the slash so it doesn't linger in the doc
        ed.commands.deleteRange({ from: Math.max(0, from - 1), to: from })
      }
    }

    editor.on('update', handleUpdate)
    return () => editor.off('update', handleUpdate)
  }, [editor, showBlockMenu])

  // Keyboard close
  useEffect(() => {
    if (!showBlockMenu) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBlockMenu(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showBlockMenu])

  const openBlockMenu = () => {
    if (!editor) return
    const { view, state } = editor
    const coords = view.coordsAtPos(state.selection.from)
    setMenuPosition({
      top: coords.top + window.scrollY + 20,
      left: coords.left + window.scrollX,
    })
    setShowBlockMenu(true)
  }

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
            <div className="editor-chrome sticky top-0 z-30">
              <div className="editor-toolbar-shell">
                <EditorToolbar editor={editor} onOpenBlockLibrary={openBlockMenu} />
              </div>
            </div>
          <EditorBubbleMenu editor={editor} />
        </>
      )}

        <div className="editor-body">
          <div className="editor-paper">
            <EditorContent editor={editor} className="h-full" />
          </div>
        </div>

      {showBlockMenu && editor && (
        <BlockLibraryMenu
          editor={editor}
          onClose={() => setShowBlockMenu(false)}
          position={menuPosition || undefined}
        />
      )}

      {/* Stats Footer */}
      {showStats && stats && isReady && (
          <div className="editor-statusbar">
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

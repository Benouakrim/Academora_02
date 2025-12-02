import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import EditorToolbar from './EditorToolbar'

type Props = {
  content: string
  onChange: (html: string) => void
  editable?: boolean
}

export default function RichTextEditor({ content, onChange, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      // StarterKit v3 already includes Link; avoid duplicate extension warnings
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: 'Start writing your story...' })
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-6'
      }
    }
  })

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

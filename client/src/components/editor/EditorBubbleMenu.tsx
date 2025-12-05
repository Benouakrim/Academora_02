import { Editor } from '@tiptap/react'
import { useState } from 'react'
import LinkDialog from './LinkDialog'

interface EditorBubbleMenuProps {
  editor: Editor
}

/**
 * Floating bubble menu that appears when text is selected
 * Note: Requires @tiptap/extension-bubble-menu to be installed
 * Temporarily disabled - install with: npm install @tiptap/extension-bubble-menu
 */
export default function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  const handleLinkInsert = (url: string) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  // Bubble menu temporarily disabled - requires additional package
  // Will be enabled once @tiptap/extension-bubble-menu is installed
  return (
    <>
      {/* BubbleMenu component will be added here once extension is installed */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onInsert={handleLinkInsert}
        initialUrl={editor.getAttributes('link').href || ''}
      />
    </>
  )
}

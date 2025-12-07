import { useState } from 'react'
import { type Editor } from '@tiptap/react'
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Highlighter, Undo, Redo, 
  Palette, Code, Table, Subscript, Superscript, Minus, Video, CodeSquare, Sparkles
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import ImageUploadDialog from './ImageUploadDialog'
import LinkDialog from './LinkDialog'
import VideoDialog from './VideoDialog'

type Props = {
  editor: Editor | null
  onOpenBlockLibrary?: () => void
}

const ButtonGroup = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex items-center gap-1 toolbar-group", className)}>
    {children}
  </div>
)

export default function EditorToolbar({ editor, onOpenBlockLibrary }: Props) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  if (!editor) return null

  const handleImageInsert = (url: string, alt?: string) => {
    editor.chain().focus().setImage({ src: url, alt }).run()
  }

  const handleLinkInsert = (url: string) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const handleVideoInsert = (url: string) => {
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const iconButton = "toolbar-icon h-9 w-9 p-0"
  const toggleButton = "toolbar-toggle h-9 w-9"
  const divider = "toolbar-divider h-8"

  return (
    <>
      <div className="editor-toolbar flex flex-wrap gap-2 items-center animate-slideDown" role="toolbar" aria-label="Formatting options">
        {typeof onOpenBlockLibrary === 'function' && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 px-3 gap-2 toolbar-cta"
              onClick={onOpenBlockLibrary}
              title="Insert advanced block (/)">
              <Sparkles className="h-4 w-4" />
              Blocks
            </Button>
            <Separator orientation="vertical" className={divider} />
          </>
        )}

        {/* History */}
        <ButtonGroup>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={iconButton} 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={iconButton} 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Typography - Headings */}
        <ButtonGroup>
          <Select
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' :
              editor.isActive('heading', { level: 4 }) ? '4' :
              'paragraph'
            }
            onValueChange={(value) => {
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run()
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(value) as 1 | 2 | 3 | 4 }).run()
              }
            }}
          >
            <SelectTrigger className="toolbar-select h-9 w-[140px]">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="1">Heading 1</SelectItem>
              <SelectItem value="2">Heading 2</SelectItem>
              <SelectItem value="3">Heading 3</SelectItem>
              <SelectItem value="4">Heading 4</SelectItem>
            </SelectContent>
          </Select>
        </ButtonGroup>

        {/* Font Size */}
        <ButtonGroup>
          <Select
            onValueChange={(value) => {
              if (value === 'unset') {
                editor.chain().focus().unsetFontSize().run()
              } else {
                editor.chain().focus().setFontSize(value).run()
              }
            }}
          >
            <SelectTrigger className="toolbar-select h-9 w-[120px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Default</SelectItem>
              <SelectItem value="12px">Small</SelectItem>
              <SelectItem value="14px">Normal</SelectItem>
              <SelectItem value="18px">Large</SelectItem>
              <SelectItem value="24px">Huge</SelectItem>
            </SelectContent>
          </Select>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Text Style */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive('bold')} 
            onPressedChange={() => editor.chain().focus().toggleBold().run()} 
            title="Bold (Ctrl+B)"
            className={toggleButton}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('italic')} 
            onPressedChange={() => editor.chain().focus().toggleItalic().run()} 
            title="Italic (Ctrl+I)"
            className={toggleButton}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('underline')} 
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()} 
            title="Underline (Ctrl+U)"
            className={toggleButton}
          >
            <Underline className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('strike')} 
            onPressedChange={() => editor.chain().focus().toggleStrike().run()} 
            title="Strikethrough (Ctrl+Shift+X)"
            className={toggleButton}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('highlight')} 
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()} 
            title="Highlight"
            className={toggleButton}
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('code')} 
            onPressedChange={() => editor.chain().focus().toggleCode().run()} 
            title="Inline Code (Ctrl+E)"
            className={toggleButton}
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Subscript & Superscript */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive('subscript')} 
            onPressedChange={() => editor.chain().focus().toggleSubscript().run()} 
            title="Subscript"
            className={toggleButton}
          >
            <Subscript className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('superscript')} 
            onPressedChange={() => editor.chain().focus().toggleSuperscript().run()} 
            title="Superscript"
            className={toggleButton}
          >
            <Superscript className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Color */}
        <ButtonGroup>
          <label className="toolbar-icon h-9 w-9 flex items-center justify-center cursor-pointer" title="Text Color">
            <Palette className="h-4 w-4" />
            <input
              type="color"
              className="sr-only"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
            />
          </label>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Alignment */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'left' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} 
            title="Align Left"
            className={toggleButton}
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'center' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} 
            title="Align Center"
            className={toggleButton}
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'right' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} 
            title="Align Right"
            className={toggleButton}
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'justify' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} 
            title="Justify"
            className={toggleButton}
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Lists & Quotes */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive('bulletList')} 
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()} 
            title="Bullet List (Ctrl+Shift+8)"
            className={toggleButton}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('orderedList')} 
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} 
            title="Ordered List (Ctrl+Shift+7)"
            className={toggleButton}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('blockquote')} 
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} 
            title="Blockquote (Ctrl+Shift+B)"
            className={toggleButton}
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('codeBlock')} 
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} 
            title="Code Block"
            className={toggleButton}
          >
            <CodeSquare className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className={divider} />

        {/* Inserts */}
        <ButtonGroup>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={cn(iconButton, editor.isActive('link') && "is-active")} 
            onClick={() => setLinkDialogOpen(true)} 
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={iconButton} 
            onClick={() => setImageDialogOpen(true)} 
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={iconButton} 
            onClick={() => setVideoDialogOpen(true)} 
            title="Embed YouTube Video"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={iconButton} 
            onClick={insertTable} 
            title="Insert Table"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className={iconButton} 
            onClick={() => editor.chain().focus().setHorizontalRule().run()} 
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        {/* Table Controls (show when table is active) */}
        {editor.isActive('table') && (
          <>
            <Separator orientation="vertical" className={divider} />
            <ButtonGroup className="animate-fadeIn">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Add Column Before"
              >
                + Col
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Column"
              >
                - Col
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Add Row Before"
              >
                + Row
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Row"
              >
                - Row
              </Button>
              <Button 
                type="button"
                variant="destructive" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Delete Table"
              >
                Del Table
              </Button>
            </ButtonGroup>
          </>
        )}
      </div>

      {/* Dialogs */}
      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={handleImageInsert}
      />

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onInsert={handleLinkInsert}
        initialUrl={editor.getAttributes('link').href || ''}
      />

      <VideoDialog
        open={videoDialogOpen}
        onOpenChange={setVideoDialogOpen}
        onInsert={handleVideoInsert}
      />
    </>
  )
}

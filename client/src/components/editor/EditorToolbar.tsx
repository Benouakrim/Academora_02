import { useState } from 'react'
import { type Editor } from '@tiptap/react'
import { 
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Heading3, Heading4, Highlighter, Undo, Redo, 
  Palette, Code, Table, Subscript, Superscript, Minus, Video, CodeSquare
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
}

const ButtonGroup = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex items-center gap-0.5", className)}>
    {children}
  </div>
)

export default function EditorToolbar({ editor }: Props) {
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

  return (
    <>
      <div className="border-b bg-muted/20 p-2 flex flex-wrap gap-2 sticky top-0 z-20 backdrop-blur-sm items-center animate-slideDown">
        {/* History */}
        <ButtonGroup>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

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
            <SelectTrigger className="h-8 w-[120px]">
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
            <SelectTrigger className="h-8 w-[100px]">
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

        <Separator orientation="vertical" className="h-8" />

        {/* Text Style */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive('bold')} 
            onPressedChange={() => editor.chain().focus().toggleBold().run()} 
            title="Bold (Ctrl+B)"
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('italic')} 
            onPressedChange={() => editor.chain().focus().toggleItalic().run()} 
            title="Italic (Ctrl+I)"
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('underline')} 
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()} 
            title="Underline (Ctrl+U)"
            className="h-8 w-8"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('strike')} 
            onPressedChange={() => editor.chain().focus().toggleStrike().run()} 
            title="Strikethrough (Ctrl+Shift+X)"
            className="h-8 w-8"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('highlight')} 
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()} 
            title="Highlight"
            className="h-8 w-8"
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('code')} 
            onPressedChange={() => editor.chain().focus().toggleCode().run()} 
            title="Inline Code (Ctrl+E)"
            className="h-8 w-8"
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

        {/* Subscript & Superscript */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive('subscript')} 
            onPressedChange={() => editor.chain().focus().toggleSubscript().run()} 
            title="Subscript"
            className="h-8 w-8"
          >
            <Subscript className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('superscript')} 
            onPressedChange={() => editor.chain().focus().toggleSuperscript().run()} 
            title="Superscript"
            className="h-8 w-8"
          >
            <Superscript className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

        {/* Color */}
        <ButtonGroup>
          <label className="h-8 w-8 flex items-center justify-center cursor-pointer hover:bg-accent rounded-md transition-colors" title="Text Color">
            <Palette className="h-4 w-4" />
            <input
              type="color"
              className="sr-only"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
            />
          </label>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'left' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} 
            title="Align Left"
            className="h-8 w-8"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'center' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} 
            title="Align Center"
            className="h-8 w-8"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'right' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} 
            title="Align Right"
            className="h-8 w-8"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive({ textAlign: 'justify' })} 
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} 
            title="Justify"
            className="h-8 w-8"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists & Quotes */}
        <ButtonGroup>
          <Toggle 
            pressed={editor.isActive('bulletList')} 
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()} 
            title="Bullet List (Ctrl+Shift+8)"
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('orderedList')} 
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} 
            title="Ordered List (Ctrl+Shift+7)"
            className="h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('blockquote')} 
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} 
            title="Blockquote (Ctrl+Shift+B)"
            className="h-8 w-8"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle 
            pressed={editor.isActive('codeBlock')} 
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} 
            title="Code Block"
            className="h-8 w-8"
          >
            <CodeSquare className="h-4 w-4" />
          </Toggle>
        </ButtonGroup>

        <Separator orientation="vertical" className="h-8" />

        {/* Inserts */}
        <ButtonGroup>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8 w-8 p-0", editor.isActive('link') && "bg-accent")} 
            onClick={() => setLinkDialogOpen(true)} 
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setImageDialogOpen(true)} 
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setVideoDialogOpen(true)} 
            title="Embed YouTube Video"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={insertTable} 
            title="Insert Table"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => editor.chain().focus().setHorizontalRule().run()} 
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        {/* Table Controls (show when table is active) */}
        {editor.isActive('table') && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <ButtonGroup className="animate-fadeIn">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Add Column Before"
              >
                + Col
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Column"
              >
                - Col
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Add Row Before"
              >
                + Row
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs px-2" 
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Row"
              >
                - Row
              </Button>
              <Button 
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

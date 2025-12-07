import { useEffect, useMemo, useState } from 'react'
import { useEditor } from '@tiptap/react'
import { useQuery } from '@tanstack/react-query'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Youtube from '@tiptap/extension-youtube'
import CharacterCount from '@tiptap/extension-character-count'
import { common, createLowlight } from 'lowlight'
import { FontSize } from '@/components/editor/extensions/FontSize'
import {
  CalculatorExtension,
  ChecklistExtension,
  CollapsibleExtension,
  ComparisonExtension,
  CtaExtension,
  QuizExtension,
  StepGuideExtension,
  TabsExtension,
  TimelineExtension,
} from '@/cms'
import { api } from '@/lib/api'

const lowlight = createLowlight(common)

interface UseArticleEditorOptions {
  content: string
  onChange: (html: string) => void
  editable?: boolean
  placeholder?: string
  mode?: 'admin' | 'user'
}

interface Taxonomies {
  categories: Array<{ id: string; name: string; slug: string }>
  tags: Array<{ id: string; name: string; slug: string }>
}

/**
 * Centralized Article Editor Hook
 * 
 * Features:
 * - Extension deduping with useMemo (prevents memory leaks)
 * - Role-based mode (admin vs user)
 * - Category/taxonomy hydration
 * - Performance optimizations
 * - Character counting
 * - Rich media support (images, videos, tables)
 */
export function useArticleEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Tell your story...',
  mode = 'user'
}: UseArticleEditorOptions) {
  const [isReady, setIsReady] = useState(false)

  // Fetch taxonomies on mount for metadata context
  const { data: taxonomies, isLoading: isLoadingTaxonomies } = useQuery<Taxonomies>({
    queryKey: ['taxonomies'],
    queryFn: async () => {
      const res = await api.get('/articles/taxonomies')
      return res.data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Deduplicate extensions using useMemo - prevents recreation on every render
  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        heading: { 
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'scroll-mt-20' // For smooth anchor scrolling
          }
        },
        codeBlock: false, // Using CodeBlockLowlight instead
        paragraph: {
          HTMLAttributes: {
            class: 'text-base leading-7'
          }
        }
      }),
      
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none before:h-0'
      }),
      
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border shadow-sm max-w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer my-4',
        },
        inline: false,
        allowBase64: true,
      }),
      
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 decoration-2 hover:text-primary/80 transition-colors cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-900/40 rounded-sm px-1 py-0.5',
        },
        multicolor: true,
      }),
      
      Underline,
      TextStyle,
      Color,
      FontSize,
      Subscript,
      Superscript,
      
      // Enhanced code block with syntax highlighting
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border border-slate-700 dark:border-slate-800 rounded-xl p-6 font-mono text-sm shadow-xl my-6 overflow-x-auto',
        },
        defaultLanguage: 'javascript',
      }),
      
      // YouTube embeds
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden shadow-lg my-6 mx-auto',
        },
        inline: false,
        controls: true,
        nocookie: true, // Privacy-enhanced mode
      }),
      
      // Table support with resizing
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-border rounded-lg overflow-hidden my-6 shadow-sm',
        },
      }),
      
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border even:bg-muted/30 transition-colors',
        },
      }),
      
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/50 font-semibold p-3 text-left',
        },
      }),
      
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-3',
        },
      }),

      // Advanced interactive CMS blocks (shared between admin & user)
      ChecklistExtension,
      QuizExtension,
      TimelineExtension,
      StepGuideExtension,
      CollapsibleExtension,
      TabsExtension,
      ComparisonExtension,
      CalculatorExtension,
      CtaExtension,
      
      // Character count for SEO and readability insights
      CharacterCount.configure({
        limit: null, // No hard limit, just counting
      }),
    ]

    // Guard against duplicate extension registrations (e.g., link/underline)
    const seen = new Set<string>()
    return baseExtensions.filter((extension) => {
      const name = (extension as any)?.name ?? (extension as any)?.config?.name
      if (!name) return true
      if (seen.has(name)) {
        if (import.meta.env.DEV) {
          console.warn(`[Editor] Dropping duplicate extension: ${name}`)
        }
        return false
      }
      seen.add(name)
      return true
    })
  }, [placeholder])

  // Initialize editor with deduped extensions
  const editor = useEditor({
    extensions,
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8 editor-content',
        spellcheck: 'true',
      },
      // Handle paste from external sources
      transformPastedHTML(html) {
        // Sanitize pasted content (remove dangerous scripts, etc.)
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/g, '')
      },
    },
    // Auto-focus on mount for better UX
    autofocus: editable ? 'end' : false,
  })

  // Sync external content changes (e.g., loading existing article)
  useEffect(() => {
    if (!editor || !content) return
    
    const currentContent = editor.getHTML()
    // Only update if content is different to avoid cursor jumps
    if (content !== currentContent && content !== '<p></p>') {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  // Mark as ready when editor and taxonomies are loaded
  useEffect(() => {
    const ready = editor && !isLoadingTaxonomies
    if (ready && !isReady) {
      // Use setTimeout to avoid cascading renders
      setTimeout(() => setIsReady(true), 0)
    }
  }, [editor, isLoadingTaxonomies, isReady])

  // Keyboard shortcuts helper
  const getShortcuts = () => {
    return {
      bold: 'Ctrl+B',
      italic: 'Ctrl+I',
      underline: 'Ctrl+U',
      strike: 'Ctrl+Shift+X',
      code: 'Ctrl+E',
      bulletList: 'Ctrl+Shift+8',
      orderedList: 'Ctrl+Shift+7',
      blockquote: 'Ctrl+Shift+B',
      undo: 'Ctrl+Z',
      redo: 'Ctrl+Y',
      link: 'Ctrl+K',
    }
  }

  // Get reading time estimate (avg 200 words/min)
  const getReadingTime = () => {
    if (!editor) return 0
    const words = editor.storage.characterCount.words()
    return Math.ceil(words / 200)
  }

  // Get SEO-friendly stats
  const getStats = () => {
    if (!editor) return null
    
    return {
      characters: editor.storage.characterCount.characters(),
      words: editor.storage.characterCount.words(),
      readingTime: getReadingTime(),
      paragraphs: editor.state.doc.textContent.split('\n\n').filter(p => p.trim()).length,
    }
  }

  return {
    editor,
    isReady,
    taxonomies,
    mode,
    shortcuts: getShortcuts(),
    stats: getStats(),
  }
}

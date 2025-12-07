import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Code, Sparkles, Save } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { convertTiptapJSONToStaticHTML, hydrateInteractiveBlocks } from '@/cms';
import type { TiptapDocument } from '@/cms/types/BlockTypes';
import { Button } from '@/components/ui/button';

const DEFAULT_DOC: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Academora CMS Demo' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Type "/" or click "Add block" to insert interactive widgets like quizzes, checklists, and calculators.',
        },
      ],
    },
    {
      type: 'checklist',
      attrs: {
        title: 'Kick-off checklist',
        allowUserEdit: true,
        items: [
          { id: '1', text: 'Brainstorm outline', checked: false },
          { id: '2', text: 'Add interactive blocks', checked: false },
          { id: '3', text: 'Publish & hydrate', checked: false },
        ],
      },
    },
    {
      type: 'quiz',
      attrs: {
        question: 'Which block helps with comparisons?',
        options: [
          { id: 'a', text: 'Tabs', isCorrect: false },
          { id: 'b', text: 'Comparison table', isCorrect: true },
          { id: 'c', text: 'Checklist', isCorrect: false },
        ],
        showExplanation: true,
        explanation: 'Use the comparison block to contrast programs, pricing, or features.',
      },
    },
  ],
};

const CMSDemo: React.FC = () => {
  const initialHTML = useMemo(() => convertTiptapJSONToStaticHTML(DEFAULT_DOC), []);
  const [editorContent, setEditorContent] = useState<string>(initialHTML);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'html'>('editor');
  const [staticHTML, setStaticHTML] = useState<string>(initialHTML);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const saveSnapshot = (nextHTML: string) => {
    setStaticHTML(nextHTML);
    setViewMode('preview');
  };

  // Hydrate blocks when switching to preview
  useEffect(() => {
    if (viewMode !== 'preview' || !staticHTML || !previewRef.current) return;
    const id = window.setTimeout(() => {
      try {
        hydrateInteractiveBlocks(previewRef.current as HTMLElement);
      } catch (err) {
        console.warn('Hydration failed in CMS demo preview', err);
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [viewMode, staticHTML]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Academora CMS Demo</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Interactive Content Management System with Tiptap v2/v3
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                viewMode === 'editor'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Editor
            </button>
            <button
              onClick={() => { setStaticHTML(editorContent); setViewMode('preview'); }}
              disabled={!editorContent}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                viewMode === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Eye className="w-5 h-5" />
              Preview (Hydrated)
            </button>
            <button
              onClick={() => { setStaticHTML(editorContent); setViewMode('html'); }}
              disabled={!editorContent}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                viewMode === 'html'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Code className="w-5 h-5" />
              HTML (SEO)
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'editor' && (
          <div className="space-y-4">
            <div className="mb-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-bold text-blue-900 mb-2">📝 Getting Started</h2>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use the <strong>Add block</strong> button or type <code className="bg-blue-100 px-1 rounded">/</code></li>
                <li>• Interactive widgets now share the same engine as the admin/user editors</li>
                <li>• Click <strong>Save snapshot</strong> to hydrate and preview your content</li>
              </ul>
            </div>
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Start writing or insert interactive blocks..."
              showStats
              mode="admin"
            />
            <div className="flex gap-3">
              <Button onClick={() => saveSnapshot(editorContent)} className="gap-2">
                <Save className="h-4 w-4" /> Save snapshot & preview
              </Button>
              <Button variant="outline" onClick={() => { setStaticHTML(editorContent); setViewMode('html'); }} className="gap-2">
                <Code className="h-4 w-4" /> View HTML
              </Button>
            </div>
          </div>
        )}

        {viewMode === 'preview' && staticHTML && (
          <div>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-bold text-green-900 mb-2">
                ✨ Interactive Preview
              </h2>
              <p className="text-sm text-green-800">
                This is the hydrated version with full interactivity. All blocks are now React
                components with state management, localStorage persistence, and event handling.
              </p>
            </div>
            <div
              id="preview-container"
              ref={previewRef}
              className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-lg"
              dangerouslySetInnerHTML={{ __html: staticHTML }}
            />
          </div>
        )}

        {viewMode === 'html' && staticHTML && (
          <div>
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h2 className="text-lg font-bold text-purple-900 mb-2">
                🔍 SEO-Friendly HTML
              </h2>
              <p className="text-sm text-purple-800 mb-2">
                This HTML is fully crawlable by search engines. All text content is present in the
                markup, and interactive blocks are marked with <code className="bg-purple-100 px-1 rounded">data-*</code> attributes.
              </p>
              <p className="text-sm text-purple-800">
                The <code className="bg-purple-100 px-1 rounded">script</code> tags contain JSON configurations that are read during hydration.
              </p>
            </div>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto">
              <pre className="text-sm">
                <code>{staticHTML}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">🎯 Editor Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 9 custom interactive blocks</li>
              <li>• Drag & drop reordering</li>
              <li>• Real-time editing</li>
              <li>• Rich text formatting</li>
              <li>• Slash commands</li>
            </ul>
          </div>
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="font-bold text-green-900 mb-2">⚡ Interactive Widgets</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Checklist with progress</li>
              <li>• Quiz with scoring</li>
              <li>• Timeline (vertical/horizontal)</li>
              <li>• Step-by-step guides</li>
              <li>• Calculators with formulas</li>
            </ul>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg">
            <h3 className="font-bold text-purple-900 mb-2">🔍 SEO Ready</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Static HTML generation</li>
              <li>• All content crawlable</li>
              <li>• Progressive enhancement</li>
              <li>• Client-side hydration</li>
              <li>• Works without JavaScript</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSDemo;

/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ComparisonView from '../nodeviews/ComparisonView.js';
import { ComparisonAttributesSchema } from '../types/BlockTypes';

export const ComparisonExtension = Node.create({
  name: 'comparison',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Comparison Table',
      },
      columns: {
        default: [
          { id: '1', header: 'Feature', cells: ['Price', 'Support', 'Users'] },
          { id: '2', header: 'Option A', cells: ['$10/mo', '24/7', 'Unlimited'] },
          { id: '3', header: 'Option B', cells: ['$20/mo', 'Email', '100'] },
        ],
      },
      rowHeaders: {
        default: ['Price', 'Support', 'Users'],
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="comparison"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return ComparisonAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse comparison config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = ComparisonAttributesSchema.parse(HTMLAttributes);
    
    const maxRows = Math.max(...attrs.columns.map((col) => col.cells.length), 0);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'comparison', class: 'comparison-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'comparison-content' },
        ['h3', {}, attrs.title],
        [
          'table',
          { class: 'comparison-table' },
          [
            'thead',
            {},
            [
              'tr',
              {},
              ...attrs.columns.map((col) => ['th', { 'data-col-id': col.id }, col.header]),
            ],
          ],
          [
            'tbody',
            {},
            ...Array.from({ length: maxRows }).map((_, rowIndex) => [
              'tr',
              {},
              ...attrs.columns.map((col) => ['td', {}, col.cells[rowIndex] || '']),
            ]),
          ],
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ComparisonView as any);
  },
  
  addCommands() {
    return {
      setComparison:
        (attributes: Record<string, unknown>) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

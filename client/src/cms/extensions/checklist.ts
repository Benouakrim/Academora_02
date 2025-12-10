/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ChecklistView from '../nodeviews/ChecklistView.js';
import { ChecklistAttributesSchema } from '../types/BlockTypes';

export const ChecklistExtension = Node.create({
  name: 'checklist',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'My Checklist',
      },
      items: {
        default: [
          { id: '1', text: 'Item 1', checked: false },
          { id: '2', text: 'Item 2', checked: false },
        ],
      },
      allowUserEdit: {
        default: true,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="checklist"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return ChecklistAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse checklist config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = ChecklistAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'checklist', class: 'checklist-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'checklist-content' },
        ['h3', {}, attrs.title],
        [
          'ul',
          { class: 'checklist-items' },
          ...attrs.items.map((item) => [
            'li',
            { 'data-item-id': item.id },
            [
              'input',
              {
                type: 'checkbox',
                checked: item.checked ? 'checked' : undefined,
                disabled: 'disabled',
              },
            ],
            ['span', {}, item.text],
          ]),
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ChecklistView as any);
  },
  
  addCommands() {
    return {
      setChecklist:
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

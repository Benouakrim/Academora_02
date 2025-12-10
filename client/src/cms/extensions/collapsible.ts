/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CollapsibleView from '../nodeviews/CollapsibleView.js';
import { CollapsibleAttributesSchema } from '../types/BlockTypes';

export const CollapsibleExtension = Node.create({
  name: 'collapsible',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Click to expand',
      },
      content: {
        default: 'This is the collapsible content that will be hidden by default.',
      },
      defaultOpen: {
        default: false,
      },
      icon: {
        default: 'ChevronDown',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="collapsible"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return CollapsibleAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse collapsible config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = CollapsibleAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'collapsible', class: 'collapsible-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'details',
        { open: attrs.defaultOpen ? 'open' : undefined, class: 'collapsible-content' },
        ['summary', { class: 'collapsible-title' }, attrs.title],
        ['div', { class: 'collapsible-body' }, attrs.content],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleView as any);
  },
  
  addCommands() {
    return {
      setCollapsible:
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

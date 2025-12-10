/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TabsView from '../nodeviews/TabsView.js';
import { TabsAttributesSchema } from '../types/BlockTypes';

export const TabsExtension = Node.create({
  name: 'tabs',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      tabs: {
        default: [
          { id: '1', label: 'Tab 1', content: 'Content for tab 1' },
          { id: '2', label: 'Tab 2', content: 'Content for tab 2' },
        ],
      },
      activeTab: {
        default: '1',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="tabs"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return TabsAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse tabs config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = TabsAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'tabs', class: 'tabs-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'tabs-content' },
        [
          'div',
          { class: 'tabs-header', role: 'tablist' },
          ...attrs.tabs.map((tab) => [
            'button',
            {
              class: tab.id === attrs.activeTab ? 'tab-button active' : 'tab-button',
              role: 'tab',
              'data-tab-id': tab.id,
            },
            tab.label,
          ]),
        ],
        [
          'div',
          { class: 'tabs-body' },
          ...attrs.tabs.map((tab) => [
            'div',
            {
              class: tab.id === attrs.activeTab ? 'tab-panel active' : 'tab-panel',
              role: 'tabpanel',
              'data-tab-id': tab.id,
            },
            tab.content,
          ]),
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(TabsView as any);
  },
  
  addCommands() {
    return {
      setTabs:
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

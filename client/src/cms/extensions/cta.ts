/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CtaView from '../nodeviews/CtaView.js';
import { CtaAttributesSchema } from '../types/BlockTypes';

export const CtaExtension = Node.create({
  name: 'cta',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Ready to get started?',
      },
      description: {
        default: 'Join thousands of students finding their perfect university match.',
      },
      buttonText: {
        default: 'Get Started',
      },
      buttonUrl: {
        default: '/signup',
      },
      backgroundColor: {
        default: '#3b82f6',
      },
      textColor: {
        default: '#ffffff',
      },
      alignment: {
        default: 'center',
      },
      size: {
        default: 'medium',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="cta"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return CtaAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse CTA config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = CtaAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({
        'data-block-type': 'cta',
        class: `cta-block cta-${attrs.alignment} cta-${attrs.size}`,
        style: `background-color: ${attrs.backgroundColor}; color: ${attrs.textColor};`,
      }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'cta-content' },
        ['h3', { class: 'cta-title' }, attrs.title],
        attrs.description ? ['p', { class: 'cta-description' }, attrs.description] : [],
        [
          'a',
          {
            href: attrs.buttonUrl,
            class: 'cta-button',
            style: `background-color: ${attrs.textColor}; color: ${attrs.backgroundColor};`,
          },
          attrs.buttonText,
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CtaView as any);
  },
  
  addCommands() {
    return {
      setCta:
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

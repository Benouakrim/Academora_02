/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TimelineView from '../nodeviews/TimelineView.js';
import { TimelineAttributesSchema } from '../types/BlockTypes';

export const TimelineExtension = Node.create({
  name: 'timeline',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Timeline',
      },
      steps: {
        default: [
          { id: '1', title: 'Step 1', description: 'First step', date: '2024' },
          { id: '2', title: 'Step 2', description: 'Second step', date: '2025' },
        ],
      },
      orientation: {
        default: 'vertical',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="timeline"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return TimelineAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse timeline config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = TimelineAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({
        'data-block-type': 'timeline',
        class: `timeline-block timeline-${attrs.orientation}`,
      }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'timeline-content' },
        ['h3', {}, attrs.title],
        [
          'div',
          { class: 'timeline-steps' },
          ...attrs.steps.map((step) => [
            'div',
            { class: 'timeline-step', 'data-step-id': step.id },
            step.date ? ['div', { class: 'timeline-date' }, step.date] : [],
            ['div', { class: 'timeline-step-title' }, step.title],
            ['div', { class: 'timeline-step-description' }, step.description],
          ]),
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(TimelineView as any);
  },
  
  addCommands() {
    return {
      setTimeline:
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

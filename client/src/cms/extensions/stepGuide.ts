/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StepGuideView from '../nodeviews/StepGuideView.js';
import { StepGuideAttributesSchema } from '../types/BlockTypes';

export const StepGuideExtension = Node.create({
  name: 'stepGuide',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Step-by-Step Guide',
      },
      steps: {
        default: [
          { id: '1', title: 'First Step', content: 'Start here', imageUrl: '' },
          { id: '2', title: 'Second Step', content: 'Continue with this', imageUrl: '' },
        ],
      },
      showNumbers: {
        default: true,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="stepGuide"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return StepGuideAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse step guide config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = StepGuideAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'stepGuide', class: 'step-guide-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'step-guide-content' },
        ['h3', {}, attrs.title],
        [
          'div',
          { class: 'guide-steps' },
          ...attrs.steps.map((step, index) => [
            'div',
            { class: 'guide-step', 'data-step-id': step.id },
            attrs.showNumbers ? ['div', { class: 'step-number' }, String(index + 1)] : [],
            ['h4', { class: 'step-title' }, step.title],
            ['div', { class: 'step-content' }, step.content],
            step.imageUrl ? ['img', { src: step.imageUrl, alt: step.title }] : [],
          ]),
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(StepGuideView as React.ComponentType);
  },
  
  addCommands() {
    return {
      setStepGuide:
        (attributes: Record<string, unknown>) =>
        ({ commands }: { commands: Record<string, unknown> }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

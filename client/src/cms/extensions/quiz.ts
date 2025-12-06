/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import QuizView from '../nodeviews/QuizView.js';
import { QuizAttributesSchema } from '../types/BlockTypes';

export const QuizExtension = Node.create({
  name: 'quiz',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      question: {
        default: 'What is the capital of France?',
      },
      options: {
        default: [
          { id: '1', text: 'Paris', isCorrect: true },
          { id: '2', text: 'London', isCorrect: false },
          { id: '3', text: 'Berlin', isCorrect: false },
          { id: '4', text: 'Madrid', isCorrect: false },
        ],
      },
      explanation: {
        default: 'Paris is the capital and largest city of France.',
      },
      showExplanation: {
        default: true,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="quiz"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return QuizAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse quiz config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = QuizAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'quiz', class: 'quiz-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'quiz-content' },
        ['h3', { class: 'quiz-question' }, attrs.question],
        [
          'ul',
          { class: 'quiz-options' },
          ...attrs.options.map((option) => [
            'li',
            { 'data-option-id': option.id },
            ['label', {}, ['input', { type: 'radio', name: 'quiz-option', disabled: 'disabled' }], option.text],
          ]),
        ],
        attrs.showExplanation && attrs.explanation
          ? ['div', { class: 'quiz-explanation' }, attrs.explanation]
          : [],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(QuizView as React.ComponentType);
  },
  
  addCommands() {
    return {
      setQuiz:
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

/* @ts-nocheck */
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CalculatorView from '../nodeviews/CalculatorView.js';
import { CalculatorAttributesSchema } from '../types/BlockTypes';

export const CalculatorExtension = Node.create({
  name: 'calculator',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,
  
  addAttributes() {
    return {
      title: {
        default: 'Tuition Calculator',
      },
      description: {
        default: 'Calculate your estimated tuition costs',
      },
      fields: {
        default: [
          {
            id: '1',
            label: 'Tuition per year',
            type: 'number',
            defaultValue: 30000,
            min: 0,
            max: 100000,
            step: 1000,
          },
          {
            id: '2',
            label: 'Number of years',
            type: 'number',
            defaultValue: 4,
            min: 1,
            max: 8,
            step: 1,
          },
        ],
      },
      formula: {
        default: 'field_1 * field_2',
      },
      resultLabel: {
        default: 'Total Cost',
      },
      resultUnit: {
        default: '$',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-block-type="calculator"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          
          const element = dom as HTMLElement;
          const configScript = element.querySelector('script[type="application/json"]');
          
          if (configScript && configScript.textContent) {
            try {
              const config = JSON.parse(configScript.textContent);
              return CalculatorAttributesSchema.parse(config);
            } catch (e) {
              console.error('Failed to parse calculator config:', e);
            }
          }
          
          return {};
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const attrs = CalculatorAttributesSchema.parse(HTMLAttributes);
    
    return [
      'div',
      mergeAttributes({ 'data-block-type': 'calculator', class: 'calculator-block' }),
      [
        'script',
        { type: 'application/json', 'data-block-config': '' },
        JSON.stringify(attrs),
      ],
      [
        'div',
        { class: 'calculator-content' },
        ['h3', {}, attrs.title],
        attrs.description ? ['p', { class: 'calculator-description' }, attrs.description] : [],
        [
          'form',
          { class: 'calculator-form' },
          ...attrs.fields.map((field) => [
            'div',
            { class: 'calculator-field', 'data-field-id': field.id },
            ['label', {}, field.label],
            [
              'input',
              {
                type: field.type,
                value: String(field.defaultValue),
                min: field.min,
                max: field.max,
                step: field.step,
              },
            ],
          ]),
          [
            'div',
            { class: 'calculator-result' },
            ['strong', {}, `${attrs.resultLabel}: `],
            ['span', { class: 'result-value' }, `${attrs.resultUnit}0`],
          ],
        ],
      ],
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CalculatorView as React.ComponentType);
  },
  
  addCommands() {
    return {
      setCalculator:
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

import type { 
  TiptapDocument, 
  TiptapNode,
  ChecklistAttributes,
  QuizAttributes,
  TimelineAttributes,
  StepGuideAttributes,
  CollapsibleAttributes,
  TabsAttributes,
  ComparisonAttributes,
  CalculatorAttributes,
  CtaAttributes,
  ChecklistItem,
  QuizOption,
  TimelineStep,
  GuideStep,
  TabItem,
  ComparisonColumn
} from './types/BlockTypes';

/**
 * Converts Tiptap JSON to static HTML for SEO purposes.
 * This HTML is crawlable by search engines and includes all textual content.
 * Interactive widgets are represented with data attributes and embedded JSON config.
 */
export function convertTiptapJSONToStaticHTML(json: TiptapDocument): string {
  if (!json || !json.content) {
    return '';
  }

  return renderNodes(json.content);
}

function renderNodes(nodes: TiptapNode[]): string {
  return nodes.map((node) => renderNode(node)).join('');
}

function renderNode(node: TiptapNode): string {
  const { type, attrs, content } = node;

  switch (type) {
    case 'paragraph':
      return `<p>${content ? renderNodes(content) : '<br>'}</p>`;

    case 'heading': {
      const level = attrs?.level || 2;
      return `<h${level}>${content ? renderNodes(content) : ''}</h${level}>`;
    }

    case 'text': {
      let text = escapeHtml(node.text || '');
      if (node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type === 'bold') text = `<strong>${text}</strong>`;
          if (mark.type === 'italic') text = `<em>${text}</em>`;
          if (mark.type === 'code') text = `<code>${text}</code>`;
          if (mark.type === 'link') text = `<a href="${mark.attrs?.href || '#'}">${text}</a>`;
        });
      }
      return text;
    }

    case 'bulletList':
      return `<ul>${content ? renderNodes(content) : ''}</ul>`;

    case 'orderedList':
      return `<ol>${content ? renderNodes(content) : ''}</ol>`;

    case 'listItem':
      return `<li>${content ? renderNodes(content) : ''}</li>`;

    case 'blockquote':
      return `<blockquote>${content ? renderNodes(content) : ''}</blockquote>`;

    case 'codeBlock':
      return `<pre><code>${content ? renderNodes(content) : ''}</code></pre>`;

    case 'hardBreak':
      return '<br>';

    case 'horizontalRule':
      return '<hr>';

    // Interactive blocks
    case 'checklist':
      return attrs ? renderChecklistBlock(attrs as ChecklistAttributes) : '';

    case 'quiz':
      return attrs ? renderQuizBlock(attrs as QuizAttributes) : '';

    case 'timeline':
      return attrs ? renderTimelineBlock(attrs as TimelineAttributes) : '';

    case 'stepGuide':
      return attrs ? renderStepGuideBlock(attrs as StepGuideAttributes) : '';

    case 'collapsible':
      return attrs ? renderCollapsibleBlock(attrs as CollapsibleAttributes) : '';

    case 'tabs':
      return attrs ? renderTabsBlock(attrs as TabsAttributes) : '';

    case 'comparison':
      return attrs ? renderComparisonBlock(attrs as ComparisonAttributes) : '';

    case 'calculator':
      return attrs ? renderCalculatorBlock(attrs as CalculatorAttributes) : '';

    case 'cta':
      return attrs ? renderCtaBlock(attrs as CtaAttributes) : '';

    default:
      return '';
  }
}

function renderChecklistBlock(attrs: ChecklistAttributes): string {
  return `
    <div class="checklist-block" data-block-type="checklist" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="checklist-content">
        <h3>${escapeHtml(attrs.title || 'Checklist')}</h3>
        <ul class="checklist-items">
          ${attrs.items
            .map(
              (item: ChecklistItem) => `
            <li data-item-id="${item.id}">
              <input type="checkbox" ${item.checked ? 'checked' : ''} disabled>
              <span>${escapeHtml(item.text)}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    </div>
  `;
}

function renderQuizBlock(attrs: QuizAttributes): string {
  return `
    <div class="quiz-block" data-block-type="quiz" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="quiz-content">
        <h3>${escapeHtml(attrs.question)}</h3>
        <ul class="quiz-options">
          ${attrs.options
            .map(
              (option: QuizOption) => `
            <li data-option-id="${option.id}">
              <label>
                <input type="radio" name="quiz-option" disabled>
                ${escapeHtml(option.text)}
              </label>
            </li>
          `
            )
            .join('')}
        </ul>
        ${
          attrs.showExplanation && attrs.explanation
            ? `<div class="quiz-explanation">${escapeHtml(attrs.explanation)}</div>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderTimelineBlock(attrs: TimelineAttributes): string {
  return `
    <div class="timeline-block timeline-${attrs.orientation || 'vertical'}" data-block-type="timeline" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="timeline-content">
        <h3>${escapeHtml(attrs.title || 'Timeline')}</h3>
        <div class="timeline-steps">
          ${attrs.steps
            .map(
              (step: TimelineStep) => `
            <div class="timeline-step" data-step-id="${step.id}">
              ${step.date ? `<div class="timeline-date">${escapeHtml(step.date)}</div>` : ''}
              <div class="timeline-step-title">${escapeHtml(step.title)}</div>
              <div class="timeline-step-description">${escapeHtml(step.description)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderStepGuideBlock(attrs: StepGuideAttributes): string {
  return `
    <div class="step-guide-block" data-block-type="stepGuide" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="step-guide-content">
        <h3>${escapeHtml(attrs.title || 'Step-by-Step Guide')}</h3>
        <div class="guide-steps">
          ${attrs.steps
            .map(
              (step: GuideStep, index: number) => `
            <div class="guide-step" data-step-id="${step.id}">
              ${attrs.showNumbers ? `<div class="step-number">${index + 1}</div>` : ''}
              <h4 class="step-title">${escapeHtml(step.title)}</h4>
              <div class="step-content">${escapeHtml(step.content)}</div>
              ${step.imageUrl ? `<img src="${escapeHtml(step.imageUrl)}" alt="${escapeHtml(step.title)}">` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCollapsibleBlock(attrs: CollapsibleAttributes): string {
  return `
    <div class="collapsible-block" data-block-type="collapsible" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <details class="collapsible-content" ${attrs.defaultOpen ? 'open' : ''}>
        <summary class="collapsible-title">${escapeHtml(attrs.title || '')}</summary>
        <div class="collapsible-body">${escapeHtml(attrs.content || '')}</div>
      </details>
    </div>
  `;
}

function renderTabsBlock(attrs: TabsAttributes): string {
  return `
    <div class="tabs-block" data-block-type="tabs" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="tabs-content">
        <div class="tabs-headers">
          ${attrs.tabs
            .map(
              (tab: TabItem) => `
            <button class="tab-button ${tab.id === attrs.activeTab ? 'active' : ''}" role="tab" data-tab-id="${tab.id}">
              ${escapeHtml(tab.label)}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="tabs-panels">
          ${attrs.tabs
            .map(
              (tab: TabItem) => `
            <div class="tab-panel ${tab.id === attrs.activeTab ? 'active' : ''}" role="tabpanel" data-tab-id="${tab.id}">
              ${escapeHtml(tab.content)}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderComparisonBlock(attrs: ComparisonAttributes): string {
  const maxRows = Math.max(...attrs.columns.map((col: ComparisonColumn) => col.cells.length), 0);

  return `
    <div class="comparison-block" data-block-type="comparison" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="comparison-content">
        <h3>${escapeHtml(attrs.title || 'Comparison')}</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              ${attrs.columns.map((col: ComparisonColumn) => `<th data-col-id="${col.id}">${escapeHtml(col.header)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: maxRows })
              .map(
                (_, rowIndex) => `
              <tr>
                ${attrs.columns.map((col: ComparisonColumn) => `<td>${escapeHtml(col.cells[rowIndex] || '')}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCalculatorBlock(attrs: any): string {
  return `
    <div class="calculator-block" data-block-type="calculator" data-block-id="${generateId()}">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="calculator-content">
        <h3>${escapeHtml(attrs.title || 'Calculator')}</h3>
        ${attrs.description ? `<p class="calculator-description">${escapeHtml(attrs.description)}</p>` : ''}
        <form class="calculator-form">
          ${attrs.fields
            .map(
              (field: any) => `
            <div class="calculator-field" data-field-id="${field.id}">
              <label>${escapeHtml(field.label)}</label>
              <input type="${field.type}" value="${field.defaultValue}" min="${field.min}" max="${field.max}" step="${field.step}">
            </div>
          `
            )
            .join('')}
          <div class="calculator-result">
            <strong>${escapeHtml(attrs.resultLabel)}: </strong>
            <span class="result-value">${attrs.resultUnit}0</span>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderCtaBlock(attrs: CtaAttributes): string {
  return `
    <div class="cta-block cta-${attrs.alignment || 'center'} cta-${attrs.size || 'medium'}" data-block-type="cta" data-block-id="${generateId()}" style="background-color: ${attrs.backgroundColor}; color: ${attrs.textColor};">
      <script type="application/json" data-block-config>${JSON.stringify(attrs)}</script>
      <div class="cta-content">
        <h3 class="cta-title">${escapeHtml(attrs.title || '')}</h3>
        ${attrs.description ? `<p class="cta-description">${escapeHtml(attrs.description)}</p>` : ''}
        <a href="${escapeHtml(attrs.buttonUrl || '#')}" class="cta-button" style="background-color: ${attrs.textColor}; color: ${attrs.backgroundColor};">
          ${escapeHtml(attrs.buttonText || 'Click here')}
        </a>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/* @ts-nocheck */
import React from 'react';
import { createRoot } from 'react-dom/client';

// Import renderers
import RenderChecklist from './renderers/renderChecklist';
import RenderQuiz from './renderers/renderQuiz';
import RenderTimeline from './renderers/renderTimeline';
import RenderStepGuide from './renderers/renderStepGuide';
import RenderCollapsible from './renderers/renderCollapsible';
import RenderTabs from './renderers/renderTabs';
import RenderComparison from './renderers/renderComparison';
import RenderCalculator from './renderers/renderCalculator';
import RenderCta from './renderers/renderCta';

/**
 * Hydrates static HTML blocks with interactive React components.
 * This function runs on the client side only and replaces server-rendered blocks
 * with fully interactive widgets.
 * 
 * @param container - The container element containing blocks to hydrate (defaults to document.body)
 */
export function hydrateInteractiveBlocks(container: HTMLElement = document.body): void {
  // Find all blocks
  const blocks = container.querySelectorAll('[data-block-type]');

  blocks.forEach((blockElement) => {
    const blockType = blockElement.getAttribute('data-block-type');
    const blockId = blockElement.getAttribute('data-block-id') || generateId();

    // Find the config script
    const configScript = blockElement.querySelector<HTMLScriptElement>(
      'script[type="application/json"][data-block-config]'
    );

    if (!configScript || !configScript.textContent) {
      console.warn(`No config found for block type: ${blockType}`);
      return;
    }

    let attrs;
    try {
      attrs = JSON.parse(configScript.textContent);
    } catch (e) {
      console.error(`Failed to parse config for block type: ${blockType}`, e);
      return;
    }

    // Get the appropriate renderer component
    const RendererComponent = getRendererComponent(blockType);

    if (!RendererComponent) {
      console.warn(`No renderer found for block type: ${blockType}`);
      return;
    }

    // Create a wrapper div for React to render into
    const reactContainer = document.createElement('div');
    reactContainer.className = `hydrated-block hydrated-${blockType}`;

    // Replace the static block with the React container
    blockElement.parentNode?.replaceChild(reactContainer, blockElement);

    // Create root and render
    const root = createRoot(reactContainer);
    root.render(
      <React.StrictMode>
        <RendererComponent attrs={attrs} blockId={blockId} />
      </React.StrictMode>
    );
  });
}

/**
 * Hydrates a single block element
 */
export function hydrateBlock(blockElement: HTMLElement): void {
  hydrateInteractiveBlocks(blockElement);
}

/**
 * Observes the DOM for new blocks and hydrates them automatically
 */
export function observeAndHydrateBlocks(container: HTMLElement = document.body): MutationObserver {
  // Initial hydration
  hydrateInteractiveBlocks(container);

  // Set up observer for dynamically added blocks
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check if the node itself is a block
          if (node.hasAttribute('data-block-type')) {
            hydrateBlock(node);
          }
          // Check for blocks within the added node
          else {
            hydrateInteractiveBlocks(node);
          }
        }
      });
    });
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Gets the appropriate renderer component for a block type
 */
function getRendererComponent(blockType: string | null): any {
  switch (blockType) {
    case 'checklist':
      return RenderChecklist as any;
    case 'quiz':
      return RenderQuiz as any;
    case 'timeline':
      return RenderTimeline as any;
    case 'stepGuide':
      return RenderStepGuide as any;
    case 'collapsible':
      return RenderCollapsible as any;
    case 'tabs':
      return RenderTabs as any;
    case 'comparison':
      return RenderComparison as any;
    case 'calculator':
      return RenderCalculator as any;
    case 'cta':
      return RenderCta as any;
    default:
      return null;
  }
}

/**
 * Generates a unique ID for blocks
 */
function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if the code is running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Safely hydrates blocks only in browser environment
 */
export function safeHydrate(container?: HTMLElement): void {
  if (isBrowser()) {
    hydrateInteractiveBlocks(container);
  }
}

// Auto-hydrate on page load if in browser
if (isBrowser()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hydrateInteractiveBlocks();
    });
  } else {
    // DOMContentLoaded already fired
    hydrateInteractiveBlocks();
  }
}

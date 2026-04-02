import { computePosition, flip, shift } from '@floating-ui/dom';
import { Content, Editor, posToDOMRect } from '@tiptap/react';
import { EXTENSION_NAME } from './constants';

/**
 * Updates the position of the suggestion dropdown based on the current selection in the editor.
 * @param editor - The Tiptap editor instance.
 * @param element - The HTML element of the suggestion dropdown that needs to be positioned.
 */
export function updatePosition(editor: Editor, element: HTMLElement): void {
  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content';
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

export function convertTemplateToNodes(template: string): Content {
  const parts = template.split('***');

  if (parts.length === 1) {
    return {
      type: 'text',
      text: template,
    };
  }

  const nodes: Content[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part) {
      nodes.push({
        type: 'text',
        text: part,
      });
    }

    if (i < parts.length - 1) {
      nodes.push({
        type: EXTENSION_NAME,
        attrs: { label: '***' },
      });
    }
  }

  return nodes;
}

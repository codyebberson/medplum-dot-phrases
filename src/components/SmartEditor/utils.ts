import { computePosition, flip, shift } from '@floating-ui/dom';
import { Editor, posToDOMRect } from '@tiptap/react';

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

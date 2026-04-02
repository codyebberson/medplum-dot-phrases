import { computePosition, flip, shift } from '@floating-ui/dom';
import { Node } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
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

export function selectNextPlaceholder(editor: Editor): boolean {
  const { state } = editor;
  const from = state.selection.to;
  const nextPos = findNextNodePos(state.doc, from, EXTENSION_NAME) ?? findNextNodePos(state.doc, 0, EXTENSION_NAME);
  if (nextPos == null) {
    return false;
  }
  return editor.chain().focus().setNodeSelection(nextPos).scrollIntoView().run();
}

export function selectPrevPlaceholder(editor: Editor): boolean {
  const { state } = editor;
  let from = state.selection.from;
  if (state.selection instanceof NodeSelection) {
    // If we're currently on a NodeSelection,
    // move back one position so we don't re-select the same node
    from = Math.max(0, from - 1);
  }
  const prevPos =
    findPrevNodePos(state.doc, from, EXTENSION_NAME) ??
    findPrevNodePos(state.doc, state.doc.content.size, EXTENSION_NAME);
  if (prevPos == null) {
    return false;
  }
  return editor.chain().focus().setNodeSelection(prevPos).scrollIntoView().run();
}

function findNextNodePos(doc: Node, from: number, nodeTypeName: string): number | null {
  let found: number | null = null;

  doc.nodesBetween(from, doc.content.size, (node: any, pos: number) => {
    if (found !== null) {
      return false;
    }

    if (node.type.name === nodeTypeName) {
      found = pos;
      return false;
    }

    return true;
  });

  return found;
}

function findPrevNodePos(doc: Node, from: number, nodeTypeName: string): number | null {
  let prev: number | null = null;

  doc.nodesBetween(0, from, (node: any, pos: number) => {
    if (node.type.name === nodeTypeName) {
      prev = pos; // keep updating → last match wins
    }
    return true;
  });

  return prev;
}

import { Editor } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { MentionList } from './MentionList';
import { updatePosition } from './utils';

const EXTENSION_NAME = 'mention';
const optionsMap = new Map<Editor, SmartPhraseSuggestionOptions>();

export function getSuggestionOptions(editor: Editor): SuggestionOptions {
  let options = optionsMap.get(editor);
  if (!options) {
    options = new SmartPhraseSuggestionOptions(editor);
    optionsMap.set(editor, options);
  }
  return options;
}

class SmartPhraseSuggestionOptions implements SuggestionOptions {
  readonly editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  command({ editor, range, props }: { editor: any; range: any; props: any }) {
    // increase range.to by one when the next node is of type "text"
    // and starts with a space character
    const nodeAfter = editor.view.state.selection.$to.nodeAfter;
    const overrideSpace = nodeAfter?.text?.startsWith(' ');

    if (overrideSpace) {
      range.to += 1;
    }

    editor
      .chain()
      .focus()
      .insertContentAt(range, [
        {
          type: EXTENSION_NAME,
          attrs: { ...props, mentionSuggestionChar: '@' },
        },
        {
          type: 'text',
          text: ' ',
        },
      ])
      .run();

    // get reference to `window` object from editor element, to support cross-frame JS usage
    editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
  }

  allow({ state, range }: { state: any; range: any }) {
    const $from = state.doc.resolve(range.from);
    const type = state.schema.nodes[EXTENSION_NAME];
    const allow = !!$from.parent.type.contentMatch.matchType(type);
    return allow;
  }

  async items({ query }: { query: string }): Promise<string[]> {
    return [
      'Lea Thompson',
      'Cyndi Lauper',
      'Tom Cruise',
      'Madonna',
      'Jerry Hall',
      'Joan Collins',
      'Winona Ryder',
      'Christina Applegate',
      'Alyssa Milano',
      'Molly Ringwald',
      'Ally Sheedy',
      'Debbie Harry',
      'Olivia Newton-John',
      'Elton John',
      'Michael J. Fox',
      'Axl Rose',
      'Emilio Estevez',
      'Ralph Macchio',
      'Rob Lowe',
      'Jennifer Grey',
      'Mickey Rourke',
      'John Cusack',
      'Matthew Broderick',
      'Justine Bateman',
      'Lisa Bonet',
    ]
      .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5);
  }

  render() {
    return new SmartPhraseSuggestionRenderer();
  }
}

class SmartPhraseSuggestionRenderer {
  component?: ReactRenderer;

  onStart(props: SuggestionProps): void {
    this.component = new ReactRenderer(MentionList, {
      props,
      editor: props.editor,
    });

    if (!props.clientRect) {
      return;
    }

    this.component.element.style.position = 'absolute';

    document.body.appendChild(this.component.element);

    updatePosition(props.editor, this.component.element);
  }

  onUpdate(props: SuggestionProps): void {
    const component = this.component as ReactRenderer;
    component.updateProps(props);

    if (!props.clientRect) {
      return;
    }

    updatePosition(props.editor, component.element);
  }

  onKeyDown(props: SuggestionKeyDownProps): boolean {
    const component = this.component as ReactRenderer;

    if (props.event.key === 'Escape') {
      component.destroy();
      return true;
    }

    return (component.ref as any)?.onKeyDown(props);
  }

  onExit(): void {
    const component = this.component as ReactRenderer;
    if (component) {
      component.element.remove();
      component.destroy();
    }
  }
}

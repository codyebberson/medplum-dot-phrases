import { Editor, Range } from '@tiptap/core';
import { EditorState, PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { EXTENSION_NAME } from './constants';
import { SmartPhrase } from './SmartPhrase';
import { SmartPhraseDropdown } from './SmartPhraseDropdown';
import { updatePosition } from './utils';

const pluginKey = new PluginKey('smartPhraseSuggestion');

const char = '@';

const optionsMap = new Map<Editor, SmartPhraseSuggestionOptions>();

const defaultSmartPhrases: SmartPhrase[] = [
  {
    id: 'brb',
    label: 'Brb',
    content: 'Be right back',
  },
  {
    id: 'omw',
    label: 'Omw',
    content: 'On my way',
  },
];

export function getSuggestionOptions(editor: Editor): SmartPhraseSuggestionOptions {
  let options = optionsMap.get(editor);
  if (!options) {
    options = new SmartPhraseSuggestionOptions(editor);
    optionsMap.set(editor, options);
  }
  return options;
}

export class SmartPhraseSuggestionOptions implements SuggestionOptions<SmartPhrase, SmartPhrase> {
  readonly pluginKey = pluginKey;
  readonly char = char;
  readonly editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  command({ editor, range, props }: { editor: Editor; range: Range; props: SmartPhrase }): void {
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
          attrs: { ...props, mentionSuggestionChar: char },
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

  allow({ state, range }: { state: EditorState; range: Range }): boolean {
    const $from = state.doc.resolve(range.from);
    const type = state.schema.nodes[EXTENSION_NAME];
    const allow = !!$from.parent.type.contentMatch.matchType(type);
    return allow;
  }

  async items({ query }: { query: string }): Promise<SmartPhrase[]> {
    return defaultSmartPhrases.filter((item) => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
  }

  render(): SmartPhraseSuggestionRenderer {
    return new SmartPhraseSuggestionRenderer();
  }
}

export class SmartPhraseSuggestionRenderer {
  component?: ReactRenderer;

  onStart(props: SuggestionProps): void {
    this.component = new ReactRenderer(SmartPhraseDropdown, {
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

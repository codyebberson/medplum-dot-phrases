import type { Attribute, Editor, KeyboardShortcutCommand } from '@tiptap/core';
import { createInlineMarkdownSpec, Node } from '@tiptap/core';
import type { DOMOutputSpec, NodeSpec } from '@tiptap/pm/model';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { Suggestion } from '@tiptap/suggestion';
import { EXTENSION_NAME } from './constants';
import { getSuggestionOptions } from './SmartPhraseSuggestionOptions';

export interface MentionOptions {}

const DefaultHTMLAttributes = {
  class: 'mention',
};

export const SmartPhraseExtension = Node.create<MentionOptions>({
  name: EXTENSION_NAME,

  priority: 101,

  addOptions(): MentionOptions {
    return {};
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes(): Record<string, Attribute> {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },

      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-label': attributes.label,
          };
        },
      },
    };
  },

  parseHTML(): NodeSpec['parseDOM'] {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node }): DOMOutputSpec {
    const suggestion = getSuggestionOptions(this.editor as Editor);
    return ['span', DefaultHTMLAttributes, `${suggestion?.char ?? '@'}${node.attrs.label ?? node.attrs.id}`];
  },

  ...createInlineMarkdownSpec({
    nodeName: 'mention',
    name: '@',
    selfClosing: true,
    allowedAttributes: ['id', 'label', { name: 'mentionSuggestionChar', skipIfDefault: '@' }],
    parseAttributes: (attrString: string) => {
      const attrs: Record<string, any> = {};
      const regex = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
      let match = regex.exec(attrString);

      while (match !== null) {
        const [, key, doubleQuoted, singleQuoted] = match;
        const value = doubleQuoted ?? singleQuoted;
        attrs[key === 'char' ? 'mentionSuggestionChar' : key] = value;
        match = regex.exec(attrString);
      }

      return attrs;
    },
    serializeAttributes: (attrs: Record<string, any>) => {
      return Object.entries(attrs)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          const serializedKey = key === 'mentionSuggestionChar' ? 'char' : key;
          return `${serializedKey}="${value}"`;
        })
        .join(' ');
    },
  }),

  renderText({ node }): string {
    const suggestion = getSuggestionOptions(this.editor as Editor);
    return `${suggestion?.char ?? '@'}${node.attrs.label ?? node.attrs.id}`;
  },

  addKeyboardShortcuts(): Record<string, KeyboardShortcutCommand> {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          // Store node and position for later use
          let mentionNode = new ProseMirrorNode();
          let mentionPos = 0;

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
              mentionNode = node;
              mentionPos = pos;
              return false;
            }
          });

          if (isMention) {
            tr.insertText(mentionNode.attrs.mentionSuggestionChar, mentionPos, mentionPos + mentionNode.nodeSize);
          }

          return isMention;
        }),
    };
  },

  addProseMirrorPlugins(): Plugin[] {
    return [Suggestion(getSuggestionOptions(this.editor as Editor))];
  },
});

import type { Editor } from '@tiptap/core';
import { createInlineMarkdownSpec, mergeAttributes, Node } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Suggestion, type SuggestionOptions } from '@tiptap/suggestion';
import { getSuggestionOptions } from './suggestion';

export interface MentionOptions {}

const DefaultHTMLAttributes = {
  class: 'mention',
};

export const Mention = Node.create<MentionOptions>({
  name: 'mention',

  priority: 101,

  addOptions() {
    return {};
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
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

      // When there are multiple types of mentions, this attribute helps distinguish them
      mentionSuggestionChar: {
        default: '@',
        parseHTML: (element) => element.getAttribute('data-mention-suggestion-char'),
        renderHTML: (attributes) => {
          return {
            'data-mention-suggestion-char': attributes.mentionSuggestionChar,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const suggestion = getSuggestionOptions(this.editor as Editor);
    const html = renderHTML(node, suggestion);
    if (typeof html === 'string') {
      return ['span', mergeAttributes({ 'data-type': this.name }, DefaultHTMLAttributes, HTMLAttributes), html];
    }
    return html;
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

  renderText({ node }) {
    const suggestion = getSuggestionOptions(this.editor as Editor);
    return renderText(node, suggestion);
  },

  addKeyboardShortcuts() {
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

  addProseMirrorPlugins() {
    return [Suggestion(getSuggestionOptions(this.editor as Editor))];
  },
});

/**
 * A function to render the text of a mention.
 * @param props The render props
 * @returns The text
 * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
 */
function renderText(node: ProseMirrorNode, suggestion: SuggestionOptions | null): string {
  return `${suggestion?.char ?? '@'}${node.attrs.label ?? node.attrs.id}`;
}

/**
 * A function to render the HTML of a mention.
 * @param props The render props
 * @returns The HTML as a ProseMirror DOM Output Spec
 * @example ({ options, node }) => ['span', { 'data-type': 'mention' }, `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`]
 */
function renderHTML(node: ProseMirrorNode, suggestion: SuggestionOptions | null): DOMOutputSpec {
  return ['span', DefaultHTMLAttributes, `${suggestion?.char ?? '@'}${node.attrs.label ?? node.attrs.id}`];
}

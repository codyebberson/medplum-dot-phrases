import { ReactRenderer } from '@tiptap/react';
import { type SuggestionOptions } from '@tiptap/suggestion';
import { MentionList } from './MentionList';
import { updatePosition } from './utils';

export const suggestion: Omit<SuggestionOptions, 'editor'> = {
  items: async ({ query }) => {
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
  },

  render: () => {
    let component: ReactRenderer;

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        component.element.style.position = 'absolute';

        document.body.appendChild(component.element);

        updatePosition(props.editor, component.element);
      },

      onUpdate(props) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        updatePosition(props.editor, component.element);
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          component.destroy();

          return true;
        }

        return (component.ref as any)?.onKeyDown(props);
      },

      onExit() {
        component.element.remove();
        component.destroy();
      },
    };
  },
};

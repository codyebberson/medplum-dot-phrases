import type { SuggestionProps } from '@tiptap/suggestion';
import { JSX, useEffect, useImperativeHandle, useState } from 'react';
import { SmartPhrase } from './SmartPhrase';
import styles from './SmartPhraseDropdown.module.css';

export type SmartPhraseDropdownProps = SuggestionProps<SmartPhrase, SmartPhrase> & {
  ref: React.Ref<{
    onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
  }>;
};

export function SmartPhraseDropdown(props: SmartPhraseDropdownProps): JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(props.ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className={styles.dropdownMenu}>
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={index === selectedIndex ? styles.isSelected : ''}
            key={index}
            onClick={() => selectItem(index)}
          >
            {JSON.stringify(item)}
          </button>
        ))
      ) : (
        <div className={styles.item}>No result</div>
      )}
    </div>
  );
}

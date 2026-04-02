// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { RichTextEditor } from '@mantine/tiptap';
import Highlight from '@tiptap/extension-highlight';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { JSX } from 'react';
import { SmartPhraseExtension } from './SmartPhraseExtension';

/**
 * Home page that greets the user and displays a list of patients.
 * @returns A React component that displays the home page.
 */
export function SmartEditor(): JSX.Element {
  const content = '<p>Subtle rich text editor variant</p>';

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit, Highlight, SmartPhraseExtension],
    content,
  });

  return (
    <RichTextEditor editor={editor} variant="subtle" flex={1}>
      <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content
        style={{
          height: 500,
          overflowY: 'auto',
        }}
      />
    </RichTextEditor>
  );
}

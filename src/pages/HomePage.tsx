// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'react';
import { SmartEditor } from '../components/SmartEditor/SmartEditor';

export function HomePage(): JSX.Element {
  return (
    <div style={{ backgroundColor: 'white' }}>
      <SmartEditor />
    </div>
  );
}

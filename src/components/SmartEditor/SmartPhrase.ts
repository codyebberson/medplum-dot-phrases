// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * The SmartPhase type represents one "template" or one "snippet".
 * These are the items that are shown in the dropdown when the user types "@" in the editor,
 * and when selected, the content of the SmartPhrase is inserted into the editor.
 */
export interface SmartPhrase {
  readonly id: string;
  readonly label: string;
  readonly content: string;
}

/**
 * The SmartPlaceholder type represents the attributes of the "smart phrase" node in the editor.
 * This is the data that is stored in the editor's document model for each instance of a smart phrase.
 * The content of the smart phrase is not stored as an attribute, but rather is generated dynamically when the node is rendered,
 * based on the label and other attributes.
 */
export interface SmartPlaceholder {
  readonly id: string;
  readonly label: string;
}

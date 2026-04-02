import { SmartPhrase } from './SmartPhrase';

export const EXTENSION_NAME = 'medplumSmartPlaceholder';

export const TEMPLATE_HELLO_WORLD = `
Hello, this is a sample note.
`;

export const TEMPLATE_HPI = `
HPI:

Patient presents with ***.

Symptoms began *** ago and have been ***.

Denies ***.
`;

export const TEMPLATE_INTRO = `
@NAME@ is a @AGE@ year-old @SEX@ presenting for evaluation.

DOB: @DOB@
MRN: @MRN@
`;

export const TEMPLATE_HPI2 = `
HPI:

@NAME@ is a @AGE@ year-old presenting with ***.

Symptoms started *** ago and are described as ***.

Severity: {mild|moderate|severe}

Associated symptoms include ***.

Denies {fever|chills|nausea|vomiting|shortness of breath}.
`;

export const TEMPLATE_AP = `
Assessment & Plan:

1. ***
   - Likely diagnosis: ***
   - Differential: ***
   - Plan: {observe|treat empirically|order labs|refer to specialist}

2. ***
   - Status: {stable|improving|worsening}
   - Medications: @MEDS@
   - Follow-up: ***
`;

export const defaultSmartPhrases: SmartPhrase[] = [
  {
    id: 'hello',
    label: 'Hello',
    content: TEMPLATE_HELLO_WORLD.trim(),
  },
  {
    id: 'hpi',
    label: 'HPI',
    content: TEMPLATE_HPI.trim(),
  },
  {
    id: 'intro',
    label: 'Intro',
    content: TEMPLATE_INTRO.trim(),
  },
  {
    id: 'hpi2',
    label: 'HPI 2',
    content: TEMPLATE_HPI2.trim(),
  },
  {
    id: 'ap',
    label: 'Assessment & Plan',
    content: TEMPLATE_AP.trim(),
  },
];

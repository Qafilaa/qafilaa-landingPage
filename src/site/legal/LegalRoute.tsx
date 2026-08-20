import { DeleteAccountBody } from './DeleteAccountBody';
import { DeleteDataBody } from './DeleteDataBody';
import { LegalShell } from './LegalShell';
import { PrivacyPolicyBody } from './PrivacyPolicyBody';
import { SecurityBody } from './SecurityBody';
import { SupportBody } from './SupportBody';
import { TermsBody } from './TermsBody';

export type LegalDoc = 'privacy' | 'terms' | 'deleteAccount' | 'deleteData' | 'support' | 'security';

const DOCS: Record<LegalDoc, { path: string; Body: () => JSX.Element }> = {
  privacy: { path: '/privacy-policy', Body: PrivacyPolicyBody },
  terms: { path: '/terms-and-conditions', Body: TermsBody },
  deleteAccount: { path: '/delete-account', Body: DeleteAccountBody },
  deleteData: { path: '/delete-data', Body: DeleteDataBody },
  support: { path: '/support', Body: SupportBody },
  security: { path: '/security', Body: SecurityBody },
};

/** One legal / support page, rendered at its own prerendered URL. */
export function LegalRoute({ doc }: { doc: LegalDoc }) {
  const { path, Body } = DOCS[doc];
  return (
    <LegalShell path={path}>
      <Body />
    </LegalShell>
  );
}

import { routePaths, type LegalRouteName } from '../../routes';
import { AccessibilityBody } from './AccessibilityBody';
import { ChildSafetyBody } from './ChildSafetyBody';
import { CommunityGuidelinesBody } from './CommunityGuidelinesBody';
import { ContactBody } from './ContactBody';
import { CookiesBody } from './CookiesBody';
import { DataSafetyBody } from './DataSafetyBody';
import { DeleteAccountBody } from './DeleteAccountBody';
import { DeleteDataBody } from './DeleteDataBody';
import { LegalShell } from './LegalShell';
import { PermissionsBody } from './PermissionsBody';
import { PrivacyPolicyBody } from './PrivacyPolicyBody';
import { ReportBody } from './ReportBody';
import { SecurityBody } from './SecurityBody';
import { SubprocessorsBody } from './SubprocessorsBody';
import { SupportBody } from './SupportBody';
import { TermsBody } from './TermsBody';

/** One component per policy / support document, keyed by route name. */
const BODIES: Record<LegalRouteName, () => JSX.Element> = {
  privacy: PrivacyPolicyBody,
  terms: TermsBody,
  cookies: CookiesBody,
  communityGuidelines: CommunityGuidelinesBody,
  childSafety: ChildSafetyBody,
  report: ReportBody,
  security: SecurityBody,
  dataSafety: DataSafetyBody,
  permissions: PermissionsBody,
  subprocessors: SubprocessorsBody,
  deleteAccount: DeleteAccountBody,
  deleteData: DeleteDataBody,
  support: SupportBody,
  contact: ContactBody,
  accessibility: AccessibilityBody,
};

/** One legal / support page, rendered at its own prerendered URL. */
export function LegalRoute({ doc }: { doc: LegalRouteName }) {
  const Body = BODIES[doc];
  return (
    <LegalShell path={routePaths[doc]}>
      <Body />
    </LegalShell>
  );
}

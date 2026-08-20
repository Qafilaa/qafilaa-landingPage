import type { LegalRouteName } from '../../routes';

/**
 * The policy / support documents, grouped as the legal-page tab rows show them.
 *
 * The handoff shipped six documents in one flat pill row. There are fifteen
 * now — every one required by a store, a regulator, or both — so they are
 * grouped rather than run on. Order here is the order a reader meets them.
 */
export const LEGAL_GROUPS: { label: string; items: { route: LegalRouteName; label: string }[] }[] = [
  {
    label: 'Legal',
    items: [
      { route: 'privacy', label: 'Privacy' },
      { route: 'terms', label: 'Terms' },
      { route: 'cookies', label: 'Cookies' },
    ],
  },
  {
    label: 'Safety',
    items: [
      { route: 'communityGuidelines', label: 'Community guidelines' },
      { route: 'childSafety', label: 'Child safety' },
      { route: 'report', label: 'Report content' },
      { route: 'security', label: 'Security' },
    ],
  },
  {
    label: 'Your data',
    items: [
      { route: 'dataSafety', label: 'Data safety' },
      { route: 'permissions', label: 'Permissions' },
      { route: 'subprocessors', label: 'Subprocessors' },
      { route: 'deleteData', label: 'Delete data' },
      { route: 'deleteAccount', label: 'Delete account' },
    ],
  },
  {
    label: 'Help',
    items: [
      { route: 'support', label: 'Support' },
      { route: 'contact', label: 'Contact' },
      { route: 'accessibility', label: 'Accessibility' },
      { route: 'licenses', label: 'Open source' },
    ],
  },
];

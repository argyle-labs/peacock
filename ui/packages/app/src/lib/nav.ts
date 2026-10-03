/**
 * Sidebar navigation sections.
 *
 * Reset to empty by the UI rebuild: an entry lands here only when its route
 * exists and is wired to the generated client. Items default to rendering as
 * `<button disabled>` rather than `<a>` until `enabled: true`, so a section can
 * be stubbed in nav without implying a working page.
 */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Fleet',
    items: [{ label: 'Systems', href: '/systems', icon: '🖧', enabled: true }],
  },
];

import type { Credential, SocialLink } from './schema'

/**
 * Who the site is about. START HERE: every page, the sidebar, the SEO tags and the legal pages read
 * these values, so changing them here changes them everywhere.
 */
export const site = {
  name: 'Your Name',
  brand: 'Your Brand',
  /** The brand name as the sidebar logo shows it: the second part takes the accent color. */
  brandParts: ['Your', 'Brand'],
  /** Your logo mark, one file per theme (`light` = for light backgrounds). The 96px copies are the
   *  sidebar header (shown at 32-36px); the full ones are the Work logo faces. */
  logo: {
    light: '/images/brand/mark.webp',
    dark: '/images/brand/mark-light.webp',
    headerLight: '/images/brand/mark-96.webp',
    headerDark: '/images/brand/mark-light-96.webp',
  },
  /** The live address, no trailing slash. Canonical URLs, the sitemap and the JSON-LD use it. */
  url: 'https://example.com',
  role: 'Your Role, Your Title',
  email: 'you@example.com',
  emailSubject: 'Project inquiry',
  replyPromise: 'Reply within one business day.',
  location: 'Your City, GMT+0',
  /** Two-letter country code (ISO 3166) for the Person JSON-LD address. */
  countryCode: 'US',
  /** Your clock, shown live at the top of the sidebar. Any IANA zone, e.g. 'America/New_York'. */
  timeZone: 'UTC',
  timePlace: 'in Your City',
  avatar: { src: '/images/profile/avatar.webp', alt: 'Your Name', width: 400, height: 400 },
  /** The sidebar picture (112px, 44px on the rail). */
  avatarSmall: '/images/profile/avatar-224.webp',
} as const

/** A credential shown in About and the sidebar check. Delete the `image` to show it without a badge. */
export const certification: Credential = {
  title: 'Your Certification',
  detail: 'Credential ID #0000',
  issuer: 'Issuing Organization',
  href: '#',
  image: { src: '/images/badges/badge.webp', alt: 'Your certification badge', width: 96, height: 96 },
}

/** Up to five fit the sidebar header. `icon` picks the glyph in components/brand/SocialIcon.tsx. */
export const socials: SocialLink[] = [
  { label: 'LinkedIn', href: '#', external: true, icon: 'linkedin' },
  { label: 'GitHub', href: '#', external: true, icon: 'github' },
  { label: 'X', href: '#', external: true, icon: 'x' },
  { label: 'Facebook', href: '#', external: true, icon: 'facebook' },
  { label: 'Discord', href: '#', external: true, icon: 'discord' },
]

/** Off-site links the pages point at. Replace each `#` with a real URL. */
export const externalLinks = {
  resource: '#',
  showcase: '#',
  company: '#',
} as const

export function mailtoHref(): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(site.emailSubject)}`
}

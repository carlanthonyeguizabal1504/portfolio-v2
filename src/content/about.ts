import type { Image, ToolMark } from './schema'
import { certification, externalLinks, site } from './site'
import { tools } from './tools'

/**
 * The Home About section: the desk illustration stands on a hairline floor with the lead over its
 * space; roles with tool logos as raised keys, credentials below.
 */
export const aboutSection = {
  eyebrow: 'About',
  titleThin: "Hi, I'm",
  titleBold: `${site.name}.`,
  lede: 'PLACEHOLDER - tell me what to put here: one sentence on what you do and for whom.',
  lead: 'PLACEHOLDER - tell me what to put here: your background.',
  leadQuiet: 'PLACEHOLDER - tell me what to put here: what you do now.',
  note: {
    company: `${site.brand} is my company`,
    product: { label: 'Your Product', href: externalLinks.showcase },
    rest: 'PLACEHOLDER - tell me what to put here: one sentence on how the product relates to your company, or delete this note.',
  },
  picture: {
    src: '/images/profile/desk.webp',
    srcSet: '/images/profile/800/desk.webp 800w, /images/profile/desk.webp 1200w',
    alt: `Illustration of ${site.name} at a desk, working at a monitor with a coffee beside them`,
    width: 1200,
    height: 889,
  } satisfies Image,
}

export const capabilities: { title: string; tools: ToolMark[] }[] = [
  { title: 'Role One', tools: [tools.toolA, tools.toolB, tools.toolC] },
  { title: 'Role Two', tools: [tools.toolD, tools.toolE, tools.toolF, tools.toolG, tools.toolH] },
  { title: 'Role Three', tools: [tools.toolD, tools.toolI, tools.toolJ, tools.toolK, tools.toolL] },
  { title: 'Role Four', tools: [tools.toolF, tools.toolG, tools.toolH] },
]

export type AboutCredential = {
  id: 'cert' | 'place' | 'community' | 'partner'
  title: string
  detail: string
  image?: Image
  /** A dark-theme version of the mark, when the light one would vanish on a dark ground (or the reverse). */
  imageDark?: Image
  href?: string
}

export const credentials: AboutCredential[] = [
  { id: 'cert', title: certification.title, detail: certification.detail, image: { ...certification.image!, alt: '' } },
  { id: 'place', title: `Based ${site.timePlace}`, detail: 'Your time zone · Your hours' },
  {
    id: 'community',
    title: 'Your Community',
    detail: 'Your role',
    href: '#',
    image: { src: '/images/badges/64/community.webp', alt: '', width: 64, height: 64 },
  },
  {
    id: 'partner',
    title: 'Your Partner',
    detail: 'Your role',
    href: '#',
    image: { src: '/images/badges/64/partner-light.webp', alt: '', width: 64, height: 64 },
    imageDark: { src: '/images/badges/64/partner.webp', alt: '', width: 64, height: 64 },
  },
]

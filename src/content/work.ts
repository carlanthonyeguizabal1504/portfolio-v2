import type { AiGroup, AppBuild, Demo, Image, LinkRef } from './schema'

export const workPage = {
  eyebrow: 'Work',
  title: 'Real builds you can open.',
  lede: 'PLACEHOLDER - tell me what to put here: one sentence on what the visitor can open in this section.',
}

/* ---------- Featured project ---------- */

const shot = (file: string, alt: string, width: number, height: number): Image => ({
  src: `/images/work/${file}`,
  alt,
  width,
  height,
})

export const featuredProject = {
  kicker: 'Featured project',
  title: 'Featured Project',
  summary: 'PLACEHOLDER - tell me what to put here: two sentences on the project you are proudest of and the result it got.',
  link: { label: 'Open the live project', href: '#', external: true } satisfies LinkRef,
  gallery: [
    shot('gallery-1.webp', 'Featured project, screen 1', 1600, 900),
    shot('gallery-2.webp', 'Featured project, screen 2', 1600, 900),
    shot('gallery-3.webp', 'Featured project, screen 3', 1600, 900),
    shot('gallery-4.webp', 'Featured project, screen 4', 1600, 900),
    shot('gallery-5.webp', 'Featured project, screen 5', 1600, 900),
    shot('gallery-6.webp', 'Featured project, screen 6', 1600, 900),
  ],
}

/* ---------- Case studies and the process doc ---------- */

export const caseStudies: { id: string; title: string; summary: string; link: LinkRef }[] = [
  {
    id: 'case-study-1',
    title: 'Case Study 1',
    summary: 'PLACEHOLDER - tell me what to put here: two sentences on the problem, what you built and the result.',
    link: { label: 'Read the case study', href: '#', external: true },
  },
  {
    id: 'case-study-2',
    title: 'Case Study 2',
    summary: 'PLACEHOLDER - tell me what to put here: two sentences on the problem, what you built and the result.',
    link: { label: 'Read the case study', href: '#', external: true },
  },
]

export const processDoc = {
  title: 'Process Doc',
  summary: 'PLACEHOLDER - tell me what to put here: two sentences on the document you show, such as a plan or a spec, and why it earns trust.',
  link: { label: 'Open the sample doc', href: '/demos/plans/sample-plan.html', external: true } satisfies LinkRef,
}

/* ---------- Screens ---------- */

export const screens: { id: string; name: string; kicker: string; summary: string }[] = [
  { id: 'screen-1', name: 'Screen One', kicker: 'Screen', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what this screen shows.' },
  { id: 'screen-2', name: 'Screen Two', kicker: 'Screen', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what this screen shows.' },
  { id: 'screen-3', name: 'Screen Three', kicker: 'Screen', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what this screen shows.' },
  { id: 'screen-4', name: 'Screen Four', kicker: 'Screen', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what this screen shows.' },
  { id: 'screen-5', name: 'Screen Five', kicker: 'Screen', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what this screen shows.' },
  { id: 'screen-6', name: 'Screen Six', kicker: 'Screen', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what this screen shows.' },
]

/* ---------- Websites (self-contained demo pages in public/demos) ---------- */

const demo = (dir: string, file: string, label: string, tag: string, summary: string): Demo => ({
  id: file,
  label,
  tag,
  summary,
  href: `/demos/${dir}/${file}.html`,
})

const SITE_SUMMARY = 'PLACEHOLDER - tell me what to put here: one sentence on the site and who it is for.'
const FUNNEL_SUMMARY = 'PLACEHOLDER - tell me what to put here: one sentence on what this funnel page does.'
const BOOKING_SUMMARY = 'PLACEHOLDER - tell me what to put here: one sentence on the booking page and its audience.'

export const sampleSites: Demo[] = [
  demo('sites', 'site-1', 'Sample Site 1', 'Website', SITE_SUMMARY),
  demo('sites', 'site-2', 'Sample Site 2', 'Website', SITE_SUMMARY),
  demo('sites', 'site-3', 'Sample Site 3', 'Website', SITE_SUMMARY),
  demo('sites', 'site-4', 'Sample Site 4', 'Website', SITE_SUMMARY),
]

export const funnelPages: Demo[] = [
  demo('funnels', 'funnel-1', 'Funnel Page 1', 'Funnel', FUNNEL_SUMMARY),
  demo('funnels', 'funnel-2', 'Funnel Page 2', 'Funnel', FUNNEL_SUMMARY),
  demo('funnels', 'funnel-3', 'Funnel Page 3', 'Funnel', FUNNEL_SUMMARY),
  demo('funnels', 'funnel-4', 'Funnel Page 4', 'Funnel', FUNNEL_SUMMARY),
]

export const bookingPages: Demo[] = [
  demo('funnels', 'booking-1', 'Booking Page 1', 'Booking', BOOKING_SUMMARY),
  demo('funnels', 'booking-2', 'Booking Page 2', 'Booking', BOOKING_SUMMARY),
]

/* ---------- Apps and extensions ---------- */

export const apps: AppBuild[] = [
  {
    id: 'app-1',
    name: 'App One',
    kind: 'Mobile app',
    tagline: 'Your tagline here.',
    summary: 'PLACEHOLDER - tell me what to put here: two sentences on what the app does and who uses it.',
    status: 'Beta',
    image: { src: '/images/apps/app-1.webp', alt: 'App One store screen', width: 540, height: 1200 },
  },
  {
    id: 'app-2',
    name: 'App Two',
    kind: 'Mobile app',
    tagline: 'Your tagline here.',
    summary: 'PLACEHOLDER - tell me what to put here: two sentences on what the app does and who uses it.',
    status: 'Beta',
    image: { src: '/images/apps/app-2.webp', alt: 'App Two screens', width: 480, height: 266 },
  },
  {
    id: 'app-3',
    name: 'App Three',
    kind: 'Mobile app',
    tagline: 'Your tagline here.',
    summary: 'PLACEHOLDER - tell me what to put here: two sentences on what the app does and who uses it.',
    status: 'Free',
    image: { src: '/images/apps/app-3.webp', alt: 'App Three screens', width: 480, height: 266 },
  },
  {
    id: 'extension-1',
    name: 'Extension One',
    kind: 'Browser extension',
    tagline: 'Your tagline here.',
    summary: 'PLACEHOLDER - tell me what to put here: one or two sentences on what the extension does in one click.',
    image: { src: '/images/apps/extension-1.webp', alt: 'Extension One popup', width: 419, height: 597 },
  },
  {
    id: 'extension-2',
    name: 'Extension Two',
    kind: 'Browser extension',
    tagline: 'Your tagline here.',
    summary: 'PLACEHOLDER - tell me what to put here: one or two sentences on what the extension does in one click.',
    image: { src: '/images/apps/extension-2.webp', alt: 'Extension Two popup', width: 403, height: 306 },
  },
]

/* ---------- Side projects and experiments (no pictures: the sheet lists them) ---------- */

export const sideProjects: AiGroup[] = [
  {
    title: 'Group One',
    summary: 'PLACEHOLDER - tell me what to put here: one line on what this group of projects has in common.',
    builds: [
      { name: 'Side Project 1', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack A, Stack B', status: 'Live' },
      { name: 'Side Project 2', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack A, Stack C', status: 'Internal' },
      { name: 'Side Project 3', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack B, Stack C', status: 'Internal' },
      { name: 'Side Project 4', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack A, Stack D', status: 'Internal' },
    ],
  },
  {
    title: 'Group Two',
    summary: 'PLACEHOLDER - tell me what to put here: one line on what this group of projects has in common.',
    builds: [
      { name: 'Side Project 5', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack B, Stack D', status: 'Live' },
      { name: 'Side Project 6', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack C, Stack D', status: 'Live' },
    ],
  },
]

export const experiments: AiGroup[] = [
  {
    title: 'Experiments',
    summary: 'PLACEHOLDER - tell me what to put here: one line on what these experiments are.',
    builds: [
      { name: 'Experiment 1', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack A', status: 'Live' },
      { name: 'Experiment 2', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack B', status: 'Live' },
      { name: 'Experiment 3', summary: 'PLACEHOLDER - tell me what to put here: one sentence on what it does.', stack: 'Stack C', status: 'Live' },
    ],
  },
]

const buildsIn = (groups: AiGroup[]) => groups.reduce((n, g) => n + g.builds.length, 0)

/** Number of builds across every Work chapter, shown as the sidebar badge. Derived, never typed in. */
export const workCount =
  1 +
  caseStudies.length +
  1 +
  screens.length +
  sampleSites.length +
  funnelPages.length +
  bookingPages.length +
  apps.length +
  buildsIn(sideProjects) +
  buildsIn(experiments)

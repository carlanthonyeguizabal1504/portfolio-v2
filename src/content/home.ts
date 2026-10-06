import type { Demo, Image, ToolMark, WorkChapter, WorkItem } from './schema'
import { site } from './site'
import { method } from './method'
import { tools } from './tools'
import {
  apps,
  bookingPages,
  caseStudies,
  experiments,
  featuredProject,
  funnelPages,
  processDoc,
  sampleSites,
  screens,
  sideProjects,
  workCount,
} from './work'

/**
 * Home page copy. The hero pairs a thin line with a bold one. The bold line is sized in `cqi` in
 * features/home/hero/hero.css so it fills the column: re-measure it when you change the words
 * (see the comment on `.hero__title` there).
 */
export const homeHero = {
  headlineThin: 'Your headline.',
  headlineBold: 'Make it yours.',
  subhead: 'PLACEHOLDER - tell me what to put here: one sentence on who you help and the result you get them.',
  cta: { label: 'Get in touch', to: '/#contact' },
}

/**
 * The statement under the hero: words light up as the page scrolls, each keyword lands bold and
 * moves the tracker. Replace the words, keep four keywords (the tracker shows them in order).
 * A string is plain words; `{ key }` is a keyword.
 */
export type ManifestoPart = string | { key: string }

export const homeManifesto = {
  eyebrow: method.eyebrow,
  parts: [
    'This is your',
    { key: 'statement.' },
    'Say who you',
    { key: 'help,' },
    'what you',
    { key: 'make' },
    'for them, and how you',
    { key: 'deliver' },
    'the result they came for.',
  ] satisfies ManifestoPart[],
}

export const homeSections = {
  work: {
    eyebrow: 'Selected work',
    title: 'Builds you can open right now.',
  },
  proof: {
    eyebrow: 'Proof',
    title: 'What I run for clients today.',
  },
  objections: {
    eyebrow: 'Before you write',
    title: 'The three questions everyone asks.',
  },
}

export const ctaBand = {
  title: 'Tell me what is eating your week.',
  body: 'PLACEHOLDER - tell me what to put here: one or two sentences on what the visitor gets when they write to you.',
  button: 'Email me your question',
}

/* ---------- Work section ---------- */

/** Full-size covers, 1800x1125, with 480 / 640 / 960 copies for the Work tiles (scripts/make-image-variants.py). */
const cover = (id: string, label: string, noun = 'page'): Image => ({
  src: `/images/covers/${id}.webp`,
  alt: `${label} ${noun}`,
  width: 1800,
  height: 1125,
  srcSet: [480, 640, 960].map((w) => `/images/covers/${w}/${id}.webp ${w}w`).join(', ') + `, /images/covers/${id}.webp 1800w`,
})
/** Workspace screens, 1600x900, with 480 / 640 / 960 copies for the Work tile (scripts/make-image-variants.py). */
const screen = (id: string, alt: string, width: number, height: number): Image => ({
  src: `/images/screens/${id}.webp`,
  alt,
  width,
  height,
  srcSet: [480, 640, 960].map((w) => `/images/screens/${w}/${id}.webp ${w}w`).join(', ') + `, /images/screens/${id}.webp ${width}w`,
})

/** A live demo page as a showcase item, with its full-size cover. */
const demoItem =
  (group: string) =>
  (demo: Demo): WorkItem => ({
    id: demo.id,
    name: demo.label,
    kicker: demo.tag,
    group,
    summary: demo.summary,
    image: cover(demo.id, demo.label),
    href: demo.href,
  })

const groupItems = (groups: typeof sideProjects): WorkItem[] =>
  groups.flatMap((group) =>
    group.builds.map((build) => ({
      id: build.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: build.name,
      kicker: group.title,
      summary: build.summary,
      stack: build.stack,
      status: build.status,
    })),
  )

/** The site's own mark for the Experiments card. The card ground is always light. */
const siteMark: ToolMark = { name: site.brand, logo: site.logo.light }

/** The URL of a chapter's showcase sheet. Real, shareable and in the sitemap. */
export const chapterPath = (id: string) => `/work/${id}`

const sideProjectItems = groupItems(sideProjects)
const experimentItems = groupItems(experiments)

export const workSection = {
  ...homeSections.work,
  /** The title as one display line in the hero's thin + bold pairing. */
  titleThin: 'Builds you can',
  titleBold: 'open right now.',
  all: { label: `See all ${workCount} builds`, to: '/work' },
}

const screenItems: WorkItem[] = screens.map((s) => ({
  id: s.id,
  name: s.name,
  kicker: s.kicker,
  summary: s.summary,
  image: screen(s.id, `${s.name}, a workspace screen`, 1600, 900),
}))

/**
 * The Work chapters, in bento order. Add, remove or reorder a chapter here; the bento, the sheets and
 * the sitemap follow (the bento's grid areas in work.css are keyed by chapter id). A chapter with a
 * `lead` is a single build; one with no landscape picture shows its `marks` as a logo face instead.
 */
export const workChapters: WorkChapter[] = [
  {
    id: 'featured',
    title: 'Featured Project',
    line: 'A short line about your best project.',
    count: 1,
    unit: 'project',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on your featured project (under 160 characters).',
    marks: [tools.toolA, siteMark],
    items: [],
    lead: cover('featured-project', featuredProject.title, 'cover'),
    gallery: featuredProject.gallery,
    link: featuredProject.link,
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    line: 'Two projects, told as problem and result.',
    count: caseStudies.length,
    unit: 'cases',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on your case studies (under 160 characters).',
    marks: [tools.toolB, tools.toolC, tools.toolD],
    items: caseStudies.map((study) => ({
      id: study.id,
      name: study.title,
      kicker: 'Case study',
      summary: study.summary,
      image: cover(study.id, study.title, 'cover'),
      href: study.link.href,
    })),
  },
  {
    id: 'process',
    title: 'Process Doc',
    line: 'A real plan, before the work starts.',
    count: 1,
    unit: 'doc',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on the process document you show (under 160 characters).',
    marks: [tools.toolE],
    items: [],
    lead: cover('process-doc', processDoc.title, 'cover'),
    link: processDoc.link,
  },
  {
    id: 'screens',
    title: 'Screens',
    line: 'Real screens from the systems you build.',
    count: screenItems.length,
    unit: 'screens',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on the screens you show (under 160 characters).',
    marks: [tools.toolF, tools.toolG, tools.toolH],
    items: screenItems,
  },
  {
    id: 'websites',
    title: 'Websites',
    line: 'Sample sites, funnel pages and booking pages.',
    count: sampleSites.length + funnelPages.length + bookingPages.length,
    unit: 'pages',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on the sites and pages people can open live (under 160 characters).',
    marks: [tools.toolI, tools.toolJ, tools.toolK],
    items: [
      ...sampleSites.map(demoItem('Sample sites')),
      ...funnelPages.map(demoItem('Funnel pages')),
      ...bookingPages.map(demoItem('Booking pages')),
    ],
  },
  {
    id: 'apps',
    title: 'Apps and Extensions',
    line: 'Phone apps and browser tools you ship.',
    count: apps.length,
    unit: 'apps',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on the apps and extensions you built (under 160 characters).',
    // The tile shows the first app's store shot, cropped from the title bar down (public/images/apps/app-1-tile.webp).
    tile: {
      src: '/images/apps/app-1-tile.webp',
      alt: 'App One store screen',
      width: 540,
      height: 928,
      srcSet: '/images/apps/320/app-1-tile.webp 320w, /images/apps/app-1-tile.webp 540w',
    },
    marks: [tools.toolL, tools.toolA, tools.toolB],
    items: apps.map((app) => ({ id: app.id, name: app.name, kicker: app.kind, summary: app.summary, image: app.image, status: app.status })),
  },
  {
    id: 'side-projects',
    title: 'Side Projects',
    line: 'Things built for fun that taught you something.',
    count: sideProjectItems.length,
    unit: 'builds',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on your side projects (under 160 characters).',
    marks: [tools.toolC, tools.toolD, tools.toolE],
    items: sideProjectItems,
  },
  {
    id: 'experiments',
    title: 'Experiments',
    line: 'Small tests, each doing one thing well.',
    count: experimentItems.length,
    unit: 'tests',
    description: 'PLACEHOLDER - tell me what to put here: one or two sentences on your experiments (under 160 characters).',
    marks: [siteMark, tools.toolF],
    items: experimentItems,
  },
]

export const findChapter = (id: string | undefined) => workChapters.find((chapter) => chapter.id === id)

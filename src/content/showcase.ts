import type { Faq, Image, ProductFilm, ProductTab } from './schema'
import { externalLinks } from './site'

/** The address shown in the browser-window bars around the film and the room screens. */
export const showcaseHost = 'Carl’s school projects'

export const showcasePage = {
  eyebrow: 'Showcase',
  titleThin: 'One product,',
  titleBold: 'shown in full detail.',
  lede: 'PLACEHOLDER - tell me what to put here: two sentences on the product or project you feature, who it is for and the main things it does.',
  footnote: 'PLACEHOLDER - tell me what to put here: one short line on how it was built or where it runs.',
  cta: { label: 'Open Product Name', href: externalLinks.showcase, external: true },
  roomsTitle: 'The five rooms',
}

/** A room capture (1600 wide) with 800 / 1200 copies: the rooms show at 343-970px (scripts/make-image-variants.py). */
const room = (file: string, alt: string, height: number): Image => ({
  src: `/images/showcase/${file}.webp`,
  alt,
  width: 1600,
  height,
  srcSet: `/images/showcase/800/${file}.webp 800w, /images/showcase/1200/${file}.webp 1200w, /images/showcase/${file}.webp 1600w`,
})

/** The product film: a short muted loop, no audio. Keep it small (a couple of MB). */
export const showcaseFilm: ProductFilm = {
  src: '/media/showcase-film.mp4',
  poster: { src: '/images/showcase/film-poster.webp', alt: 'Product Name film', width: 1280, height: 720 },
  pagePosters: { phone: '/images/showcase/film-poster-640.webp', wide: '/images/showcase/film-poster-960.webp' },
  name: 'Product Name: a short tour',
  description: 'PLACEHOLDER - tell me what to put here: one sentence on what the film shows, in the order it shows it.',
  duration: '0:10',
  // The date the film was first published (YYYY-MM-DD), used in the page's structured data.
  published: '2026-01-01',
}

/** Number + unit. Use only figures you can state as fact. */
export const showcaseStats: [string, string][] = [
  ['00+', 'stat label one'],
  ['00', 'stat label two'],
  ['00', 'stat label three'],
  ['5', 'rooms, one tab'],
]

/** The five rooms of the product, each with a caption and a screen. */
export const productTabs: ProductTab[] = [
  {
    id: 'room-1',
    label: 'Room One',
    body: 'PLACEHOLDER - tell me what to put here: two sentences on what this part of the product does for the person using it.',
    image: room('room-1', 'Screen of the first room', 1000),
  },
  {
    id: 'room-2',
    label: 'Room Two',
    body: 'PLACEHOLDER - tell me what to put here: two sentences on what this part of the product does for the person using it.',
    image: room('room-2', 'Screen of the second room', 1000),
  },
  {
    id: 'room-3',
    label: 'Room Three',
    body: 'PLACEHOLDER - tell me what to put here: two sentences on what this part of the product does for the person using it.',
    image: room('room-3', 'Screen of the third room', 1000),
  },
  {
    id: 'room-4',
    label: 'Room Four',
    body: 'PLACEHOLDER - tell me what to put here: two sentences on what this part of the product does for the person using it.',
    image: room('room-4', 'Screen of the fourth room', 1000),
  },
  {
    id: 'room-5',
    label: 'Room Five',
    body: 'PLACEHOLDER - tell me what to put here: two sentences on what this part of the product does for the person using it.',
    image: room('room-5', 'Screen of the fifth room', 1000),
  },
]

/** Three questions people ask about the product, answered the way the product itself answers them. */
export const showcaseFaq: Faq[] = [
  {
    question: 'Who is Product Name for?',
    answer: 'PLACEHOLDER - tell me what to put here: who the product suits and who it does not, in two or three sentences.',
  },
  {
    question: 'Is there anything to install?',
    answer: 'PLACEHOLDER - tell me what to put here: where it runs (browser, app store, desktop) and what a new user needs to start.',
  },
  {
    question: 'What does Product Name cost?',
    answer: 'PLACEHOLDER - tell me what to put here: the plans and prices as they are today, or that it is free, in two sentences.',
  },
]

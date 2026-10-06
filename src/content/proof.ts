import type { ClientAccount, Quote, VideoTestimonial } from './schema'

export const proofPage = {
  eyebrow: 'Proof',
  titleThin: 'Results you',
  titleBold: 'can check.',
  bands: { videos: 'On camera', quotes: 'In the community', clients: 'Client accounts' },
  lede: 'PLACEHOLDER - tell me what to put here: one or two sentences introducing the client accounts, the video clips and the written feedback below.',
}

/** Client names stay anonymised: the label is shown, the role and the work say what you do for them. */
export const clientAccounts: ClientAccount[] = [
  {
    label: 'Client Name 1',
    role: 'PLACEHOLDER - your role for this client',
    work: 'PLACEHOLDER - tell me what to put here: one or two sentences on what you run or build for this client and what keeps it moving.',
    tags: ['Tag A', 'Tag B', 'Tag C'],
    logo: { src: '/images/clients/64/client-1.webp', alt: 'Client Name 1 logo', width: 64, height: 64 },
  },
  {
    label: 'Client Name 2',
    role: 'PLACEHOLDER - your role for this client',
    work: 'PLACEHOLDER - tell me what to put here: one or two sentences on what you build inside this client\'s systems and what you hand over.',
    tags: ['Tag A', 'Tag B', 'Tag C'],
    logo: { src: '/images/clients/64/client-2.webp', alt: 'Client Name 2 logo', width: 64, height: 64 },
  },
  {
    label: 'Client Name 3',
    role: 'PLACEHOLDER - your role for this client',
    work: 'PLACEHOLDER - tell me what to put here: one or two sentences on the part of this client\'s work you own and the result it produces.',
    tags: ['Tag A', 'Tag B', 'Tag C'],
    // No logo: the ledger shows the row number in its place. Add `logo` like the two above to show one.
  },
]

export const videoTestimonials: VideoTestimonial[] = [
  {
    id: 'client-clip-1',
    src: '/media/clip-1.mp4',
    poster: '/media/clip-1-poster.jpg',
    width: 640,
    height: 360,
    duration: '0:08',
    label: 'Client video 1',
    published: '2026-01-01',
  },
  {
    id: 'client-clip-2',
    src: '/media/clip-2.mp4',
    poster: '/media/clip-2-poster.jpg',
    width: 464,
    height: 832,
    duration: '0:08',
    label: 'Client video 2',
    published: '2026-01-01',
  },
]

/** Written feedback. Only named, dated quotes are used. */
export const communityQuotes: Quote[] = [
  {
    name: 'Person Name 1',
    context: 'Role, Company',
    date: 'Jan 1, 2026',
    text: 'PLACEHOLDER - tell me what to put here: a real quote from this person, one to three sentences, word for word.',
  },
  {
    name: 'Person Name 2',
    context: 'Role, Company',
    date: 'Jan 1, 2026',
    text: 'PLACEHOLDER - tell me what to put here: a real quote from this person, one to three sentences, word for word.',
  },
  {
    name: 'Person Name 3',
    context: 'Role, Company',
    date: 'Jan 1, 2026',
    text: 'PLACEHOLDER - tell me what to put here: a real quote from this person, one to three sentences, word for word.',
  },
  {
    name: 'Person Name 4',
    context: 'Role, Company',
    date: 'Jan 1, 2026',
    text: 'PLACEHOLDER - tell me what to put here: a real quote from this person, one to three sentences, word for word.',
  },
]

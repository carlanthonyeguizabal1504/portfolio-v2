import type { Service } from './schema'
import { tools } from './tools'

export const servicesPage = {
  eyebrow: 'Services',
  title: 'Everything you offer, in one line each.',
  lede: 'PLACEHOLDER - tell me what to put here: one sentence on what you offer and how a client can combine it.',
}

/**
 * The Home Services section: a stack of cards dealt onto a pile as the page scrolls. The display line
 * is the thin + bold pair below.
 */
export const servicesSection = {
  eyebrow: servicesPage.eyebrow,
  titleThin: 'Pick one',
  titleBold: 'or stack a few.',
  explore: 'Explore',
  /** The Work chapter each card opens, by service id (a chapter id from home.ts). */
  work: { 'service-1': 'screens', 'service-2': 'featured', 'service-3': 'websites', 'service-4': 'websites', 'service-5': 'apps' } as Record<string, string>,
}

const SUMMARY = 'PLACEHOLDER - tell me what to put here: the benefit of this service in one line.'
const BULLET = 'PLACEHOLDER - tell me what to put here: one short benefit'

export const services: Service[] = [
  {
    id: 'service-1',
    title: 'Service One',
    summary: SUMMARY,
    outcome: 'Outcome One',
    bullets: [BULLET, BULLET, BULLET],
    tools: [tools.toolA, tools.toolB, tools.toolC],
  },
  {
    id: 'service-2',
    title: 'Service Two',
    summary: SUMMARY,
    outcome: 'Outcome Two',
    bullets: [BULLET, BULLET, BULLET],
    tools: [tools.toolD, tools.toolE, tools.toolF],
  },
  {
    id: 'service-3',
    title: 'Service Three',
    summary: SUMMARY,
    outcome: 'Outcome Three',
    bullets: [BULLET, BULLET, BULLET],
    tools: [tools.toolG, tools.toolH, tools.toolI],
  },
  {
    id: 'service-4',
    title: 'Service Four',
    summary: SUMMARY,
    outcome: 'Outcome Four',
    bullets: [BULLET, BULLET, BULLET],
    tools: [tools.toolJ, tools.toolK, tools.toolL],
  },
  {
    id: 'service-5',
    title: 'Service Five',
    summary: SUMMARY,
    outcome: 'Outcome Five',
    bullets: [BULLET, BULLET, BULLET],
    tools: [tools.toolA, tools.toolF, tools.toolK],
  },
]

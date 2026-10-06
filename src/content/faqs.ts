import type { Faq } from './schema'

/** The questions people ask before they write. Pages pick the ones that answer their own objection. */
export const faqs = {
  whatYouBuild: {
    question: 'What do you actually build?',
    answer: 'PLACEHOLDER - tell me what to put here: the kinds of work you take on and who it is usually for, in two sentences.',
  },
  startSpeed: {
    question: 'How fast can you start?',
    answer: 'PLACEHOLDER - tell me what to put here: how soon you can begin small and large jobs, and the hours or time zones you overlap.',
  },
  needStack: {
    question: 'Do I need a specific platform?',
    answer: 'PLACEHOLDER - tell me what to put here: which tools you work in, and what you do when a client stack is a poor fit.',
  },
  pricing: {
    question: 'How much do you charge?',
    answer: 'PLACEHOLDER - tell me what to put here: how you price (fixed, hourly, retainer), what comes before a quote, and what is included.',
  },
  afterWrite: {
    question: 'What happens after I write?',
    answer: 'PLACEHOLDER - tell me what to put here: how fast you reply and what the visitor gets back (a plan, a call, a straight no).',
  },
} satisfies Record<string, Faq>

export const allFaqs: Faq[] = Object.values(faqs)

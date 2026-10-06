import { site } from './site'

export type LegalSection = { heading: string; paragraphs: string[] }

export type LegalDoc = {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

/** What this site actually stores and loads. Keep in sync with src/lib/storage.ts and src/lib/analytics.ts. */
export const privacyPolicy: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'January 1, 2026',
  intro: `This policy covers ${site.url.replace('https://', '')}, the portfolio of ${site.name} trading as ${site.brand}. PLACEHOLDER - tell me what to put here: one line saying this page is a template and not legal advice, and that you have had it checked for where you operate.`,
  sections: [
    {
      heading: 'What this site collects',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: what the site collects about visitors (the contact form only opens the visitor\'s own mail app and sends nothing to this site, unless you add a backend).',
        'PLACEHOLDER - tell me what to put here: what happens to an email a visitor sends you, how long you keep it and how they can ask you to delete it.',
      ],
    },
    {
      heading: 'What your browser stores',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: what this site stores in the visitor\'s browser (the theme choice and whether the sidebar is collapsed, in localStorage, nothing else unless you add analytics).',
      ],
    },
    {
      heading: 'Analytics',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: whether analytics runs, which provider, and that it only loads after the visitor agrees (the consent notice is built in).',
      ],
    },
    {
      heading: 'Hosting',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: where the site is hosted and what the host logs (usually IP address, page requested and time).',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        `PLACEHOLDER - tell me what to put here: how a visitor asks what you hold about them or asks you to delete it, and the rights that apply where you operate. Contact: ${site.email}.`,
      ],
    },
    {
      heading: 'Changes',
      paragraphs: ['PLACEHOLDER - tell me what to put here: how you announce a change to this policy (for example, the date at the top changes).'],
    },
  ],
}

export const termsOfService: LegalDoc = {
  title: 'Terms of Service',
  updated: 'January 1, 2026',
  intro: `These terms cover your use of this portfolio site, run by ${site.name} trading as ${site.brand}. PLACEHOLDER - tell me what to put here: one line saying this page is a template and not legal advice, and that you have had it checked for where you operate.`,
  sections: [
    {
      heading: 'Using this site',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: what visitors may do on the site, and a note that the sample pages and demos use made-up names and details.',
      ],
    },
    {
      heading: 'Working together',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: that nothing on the site is a binding offer and how client work starts (a call, a written proposal, a signed agreement).',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: who owns the site design, copy and your own work, how third-party logos are used, and how client work is shown.',
      ],
    },
    {
      heading: 'No warranties',
      paragraphs: [
        'PLACEHOLDER - tell me what to put here: that the site is provided as is, and what you do and do not promise about accuracy and availability.',
      ],
    },
    {
      heading: 'External links',
      paragraphs: ['PLACEHOLDER - tell me what to put here: that links to other sites are for convenience and what you take no responsibility for.'],
    },
    {
      heading: 'Governing law',
      paragraphs: ['PLACEHOLDER - tell me what to put here: which country or state\'s law governs these terms.'],
    },
    {
      heading: 'Contact',
      paragraphs: [`Questions about these terms: ${site.email}.`],
    },
  ],
}

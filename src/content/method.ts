import type { MethodStep } from './schema'

/** Your method: the three jobs your service does for a client, in order. It names the steps of the Home automation diagram. */
export const method = {
  eyebrow: 'Your Method',
  title: 'Attract. Nurture. Convert.',
  summary: 'PLACEHOLDER - tell me what to put here: one line on the three jobs your work does for a client, in order.',
  steps: [
    { name: 'Attract', body: 'PLACEHOLDER - tell me what to put here: one short line on step one.', inputs: ['Input A', 'Input B', 'Input C', 'Input D'] },
    { name: 'Nurture', body: 'PLACEHOLDER - tell me what to put here: one short line on step two.', inputs: ['Input A', 'Input B', 'Input C'] },
    { name: 'Convert', body: 'PLACEHOLDER - tell me what to put here: one short line on step three.', inputs: ['Input A', 'Input B', 'Input C'] },
  ] satisfies MethodStep[],
}

import type { ToolMark } from './schema'

const mark = (name: string, file: string, mono?: true): ToolMark => ({ name, logo: `/images/tools/${file}`, mono })

/**
 * Every tool logo the site can show. Pages reference these, never a raw path. The twelve marks are
 * generic placeholders (public/images/tools/tool-01.svg ... tool-12.svg): swap each name and file for a
 * real tool you use. A black one-colour logo takes a third argument, `true`, so it is inverted on dark
 * grounds and never disappears.
 */
export const tools = {
  toolA: mark('Tool A', 'tool-01.svg'),
  toolB: mark('Tool B', 'tool-02.svg'),
  toolC: mark('Tool C', 'tool-03.svg'),
  toolD: mark('Tool D', 'tool-04.svg'),
  toolE: mark('Tool E', 'tool-05.svg'),
  toolF: mark('Tool F', 'tool-06.svg'),
  toolG: mark('Tool G', 'tool-07.svg'),
  toolH: mark('Tool H', 'tool-08.svg'),
  toolI: mark('Tool I', 'tool-09.svg'),
  toolJ: mark('Tool J', 'tool-10.svg'),
  toolK: mark('Tool K', 'tool-11.svg'),
  toolL: mark('Tool L', 'tool-12.svg'),
} satisfies Record<string, ToolMark>

/** The daily drivers, in the order you want them shown. */
export const dailyTools: ToolMark[] = [
  tools.toolA,
  tools.toolB,
  tools.toolC,
  tools.toolD,
  tools.toolE,
  tools.toolF,
  tools.toolG,
  tools.toolH,
  tools.toolI,
  tools.toolJ,
  tools.toolK,
]

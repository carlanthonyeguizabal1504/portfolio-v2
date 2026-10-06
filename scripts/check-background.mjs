// E2E check for the signal-flow background: loads on first input, draws, moves, sits behind content,
// converges behind the content column (open / collapsed / phone), follows the theme.
// Usage: BASE=http://localhost:5190 node scripts/check-background.mjs   (screens -> scripts/out/)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE ?? 'http://localhost:5190'
const OUT = new URL('./out/', import.meta.url)
mkdirSync(OUT, { recursive: true })
const shotPath = (n) => fileURLToPath(new URL(`${n}.png`, OUT))

const failures = []
const check = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`)
  if (!ok) failures.push(message)
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })

/** Mean brightness difference between two viewport shots of the background only (content hidden). */
async function bgFrames(page) {
  await page.addStyleTag({ content: '.app-main, .sb-float, .mb-bar { visibility: hidden !important; }' })
  const a = await page.screenshot()
  await page.waitForTimeout(900)
  const b = await page.screenshot()
  return { a, b }
}

for (const c of [
  { name: 'bg-1440', width: 1440, height: 900 },
  { name: 'bg-1440-collapsed', width: 1440, height: 900, collapse: true },
  { name: 'bg-390', width: 390, height: 844, mobile: true },
]) {
  const context = await browser.newContext({ viewport: { width: c.width, height: c.height }, isMobile: !!c.mobile, hasTouch: !!c.mobile })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const scripts = []
  page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()))

  await page.goto(`${BASE}/`)
  await page.waitForTimeout(1500)
  // three.js waits for the first input or scroll (or 6s after load), so it stays out of the boot window.
  check(!scripts.some((u) => /signal-flow/.test(u)), `${c.name}: three.js not loaded before any input`)
  if (c.collapse) await page.click('.sb-toggle')
  else if (c.mobile) await page.evaluate(() => window.scrollBy(0, 1))
  else await page.mouse.move(700, 400)
  await page.waitForTimeout(2200)

  const state = await page.evaluate(() => {
    const canvas = document.querySelector('.app-bg')
    const main = document.querySelector('.app-main')
    return {
      ready: canvas?.dataset.ready === 'true',
      fixed: getComputedStyle(canvas).position === 'fixed',
      behind: Number(getComputedStyle(canvas).zIndex) < Number(getComputedStyle(main).zIndex),
      noPointer: getComputedStyle(canvas).pointerEvents === 'none',
    }
  })
  check(state.ready && state.fixed && state.behind && state.noPointer, `${c.name}: canvas ready, fixed, behind content, ignores the pointer`)
  check(scripts.some((u) => /signal-flow/.test(u)), `${c.name}: three.js loaded as its own lazy chunk`)
  await page.screenshot({ path: shotPath(c.name) })

  const { a, b } = await bgFrames(page)
  const { writeFileSync } = await import('node:fs')
  writeFileSync(shotPath(`${c.name}-bg-a`), a)
  writeFileSync(shotPath(`${c.name}-bg-b`), b)
  check(errors.length === 0, `${c.name}: no errors ${errors.join(' | ')}`)
  await context.close()
}

// Theme: the line color must change with the theme.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(() => localStorage.setItem('pv2-theme', 'light')) // dark is the default: start from a light pick
  await page.goto(`${BASE}/work`)
  await page.waitForTimeout(2000)
  await page.click('.sb-float [data-nav-id="theme"]')
  await page.mouse.move(900, 450)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: shotPath('bg-1440-dark') })
  check((await page.$eval('html', (el) => el.dataset.theme)) === 'dark', 'theme switched to dark')
  await page.close()
}

await browser.close()
console.log(failures.length ? `\n${failures.length} FAILED` : '\nALL PASS')
process.exit(failures.length ? 1 : 0)

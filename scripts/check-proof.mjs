// E2E check for the Proof page: head + JSON-LD (Quotation, VideoObject, no Review), the clips playing in
// place (one at a time), the sticky band labels, images, overflow.
// Usage: BASE=http://localhost:5190 node scripts/check-proof.mjs   (screens -> scripts/out/proof/)
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:5190'
const OUT = new URL('./out/proof/', import.meta.url)
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const shot = (page, name, full = false) => page.screenshot({ path: new URL(`${name}.png`, OUT).pathname.slice(1), fullPage: full })

const failures = []
const check = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`)
  if (!ok) failures.push(message)
}

const scrollTo = (page, y) =>
  page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y)

const browser = await chromium.launch()

for (const [label, viewport, extra, theme] of [
  ['desk', { width: 1440, height: 900 }, {}, 'light'],
  ['laptop', { width: 1280, height: 720 }, {}, 'light'],
  ['desk-dark', { width: 1440, height: 900 }, {}, 'dark'],
  ['phone', { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, 'light'],
  ['reduced', { width: 1440, height: 900 }, { reducedMotion: 'reduce' }, 'light'],
]) {
  const context = await browser.newContext({ viewport, ...extra })
  await context.addInitScript((t) => localStorage.setItem('pv2-theme', t), theme)
  const page = await context.newPage()
  const errors = []
  const bad = []
  const media = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`))
  page.on('request', (r) => r.url().endsWith('.mp4') && media.push(r.url()))
  await page.goto(`${BASE}/proof`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await shot(page, `${label}-top`)

  if (label === 'desk') {
    const head = await page.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector('link[rel=canonical]')?.href,
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      times: [...document.querySelectorAll('.pf-quote time')].map((t) => t.getAttribute('datetime')),
    }))
    check(head.title.startsWith('Proof') && head.title.endsWith('Your Name'), `title is the route's own, ends with the site name (${head.title})`)
    check(head.canonical?.endsWith('/proof'), `canonical is /proof (${head.canonical})`)
    check(head.h1.length === 1, `one h1 (${head.h1.join(' | ')})`)
    let nodes = []
    try {
      nodes = head.ld.flatMap((s) => JSON.parse(s)['@graph'])
    } catch (e) {
      check(false, `JSON-LD parses (${e.message})`)
    }
    const parts = nodes.find((n) => n['@type'] === 'WebPage')?.hasPart ?? []
    const quotes = parts.filter((p) => p['@type'] === 'Quotation')
    const videos = parts.filter((p) => p['@type'] === 'VideoObject')
    check(quotes.length === 4 && quotes.every((q) => /^\d{4}-\d{2}-\d{2}$/.test(q.dateCreated)), `JSON-LD: 4 Quotations with ISO dates (${quotes.map((q) => q.dateCreated)})`)
    check(videos.length === 2 && videos.every((v) => v.uploadDate && v.thumbnailUrl && /^PT\d+M\d+S$/.test(v.duration)), `JSON-LD: 2 VideoObjects with upload date, thumbnail, duration`)
    check(!JSON.stringify(nodes).match(/"(Review|AggregateRating)"/), 'JSON-LD has no Review or AggregateRating')
    check(nodes.some((n) => n['@type'] === 'BreadcrumbList'), 'JSON-LD has a BreadcrumbList')
    check(head.times.length === 4 && head.times.every((t) => /^\d{4}-\d{2}-\d{2}$/.test(t)), `quote dates carry machine dates (${head.times})`)
  }

  check(media.length === 0, `${label}: no clip downloads before a tap (${media.length})`)

  // Play in place, one at a time.
  await page.locator('.pf-clip').first().scrollIntoViewIfNeeded()
  await page.locator('.pf-clip').nth(0).locator('.pg-play').click()
  await page.waitForTimeout(1500)
  const one = await page.evaluate(() => [...document.querySelectorAll('.pf-clip video')].map((v) => ({ paused: v.paused, t: v.currentTime, controls: v.controls })))
  check(one.length === 1 && !one[0].paused && one[0].t > 0 && one[0].controls, `${label}: clip 1 plays in place with controls`)
  if (label === 'desk') await shot(page, `${label}-clip-playing`)
  await page.locator('.pf-clip').nth(1).scrollIntoViewIfNeeded()
  await page.locator('.pf-clip').nth(1).locator('.pg-play').click()
  await page.waitForTimeout(1500)
  const two = await page.evaluate(() => [...document.querySelectorAll('.pf-clip video')].map((v) => v.paused))
  check(two.length === 2 && two[0] === true && two[1] === false, `${label}: starting clip 2 pauses clip 1 (${two})`)

  // The band label holds while its band scrolls by (desktop).
  if (label !== 'phone') {
    // The band's top 200px above the screen: an unstuck label would have gone with it.
    const y = await page.evaluate(() => document.querySelector('#pf-quotes').closest('.pf-band').getBoundingClientRect().top + scrollY + 200)
    await scrollTo(page, y)
    await page.waitForTimeout(500)
    const top = await page.evaluate(() => Math.round(document.querySelector('#pf-quotes').parentElement.getBoundingClientRect().top))
    check(Math.abs(top - 24) <= 2, `${label}: the "In the community" label holds at the top (${top}px)`)
    await shot(page, `${label}-quotes`)
  }

  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += Math.round(viewport.height * 0.8)) {
    await scrollTo(page, y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(800)
  const imgs = await page.evaluate(() => [...document.querySelectorAll('main img')].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src))
  check(imgs.length === 0, `${label}: every image loads${imgs.length ? ` (broken: ${imgs.join(', ')})` : ''}`)
  check(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${label}: no sideways page scroll`)
  if (label === 'phone' || label === 'desk') await shot(page, `${label}-full`, true)
  check(errors.length === 0, `${label}: no page errors${errors.length ? ` (${errors.join(' | ')})` : ''}`)
  check(bad.length === 0, `${label}: no 4xx/5xx responses${bad.length ? ` (${bad.join(', ')})` : ''}`)
  await context.close()
}

await browser.close()
console.log(failures.length ? `\n${failures.length} failed` : '\nall passed')
process.exit(failures.length ? 1 : 0)

// E2E check for /contact (pick A "Answers, then write"). Drives it like a visitor.
// Usage: BASE=http://localhost:5190 node scripts/check-contact.mjs   (screens -> scripts/out/contact-*.png)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BASE = process.env.BASE ?? 'http://localhost:5190'
const OUT = new URL('./out/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const failures = []
const check = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`)
  if (!ok) failures.push(message)
}
const shot = (page, name) => page.screenshot({ path: fileURLToPath(new URL(`contact-${name}.png`, OUT)), fullPage: true })

const browser = await chromium.launch()

for (const run of [
  { name: 'desk-dark', viewport: { width: 1440, height: 900 }, theme: 'dark' },
  { name: 'desk-light', viewport: { width: 1440, height: 900 }, theme: 'light' },
  { name: 'phone', viewport: { width: 390, height: 844 }, theme: 'dark', isMobile: true, hasTouch: true },
]) {
  const context = await browser.newContext({ viewport: run.viewport, isMobile: run.isMobile, hasTouch: run.hasTouch })
  await context.addInitScript((t) => {
    localStorage.setItem('pv2-theme', t)
    // The mail-app hand-off: record the URL instead of leaving the page.
    window.open = (url) => ((window.__mailto = String(url)), null)
  }, run.theme)
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ct-form')
  await page.waitForTimeout(600)
  const tag = run.name

  const head = await page.evaluate(() => ({
    title: document.title,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    robots: document.querySelector('meta[name="robots"]')?.content ?? null,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)['@graph'].map((n) => n['@type'])).flat(),
  }))
  check(head.title.startsWith('Contact') && head.title.endsWith('Your Name') && head.h1.length === 1 && head.h1[0] === 'Tell me what you need built.', `${tag}: title + one h1 (${head.h1})`)
  check(head.robots === null, `${tag}: indexable (no noindex placeholder)`)
  check(['ContactPage', 'FAQPage', 'BreadcrumbList'].every((t) => head.ld.includes(t)), `${tag}: JSON-LD ${head.ld}`)

  const open = () => page.$$eval('.ct-acc details', (d) => d.map((x) => x.open))
  check(JSON.stringify(await open()) === JSON.stringify([true, false, false, false, false]), `${tag}: first answer open at rest`)
  await page.click('.ct-acc details:nth-child(3) summary')
  await page.waitForTimeout(200)
  check(JSON.stringify(await open()) === JSON.stringify([false, false, true, false, false]), `${tag}: opening one answer closes the other`)
  const summaryH = await page.$eval('.ct-acc summary', (s) => s.getBoundingClientRect().height)
  check(summaryH >= 44, `${tag}: question rows are 44px+ targets (${summaryH})`)

  const socials = await page.$$eval('.ct-direct .social-key', (a) => a.map((x) => x.title))
  check(socials.length === 5 && socials.at(-1) === 'Discord', `${tag}: socials under the answers (${socials})`)
  check((await page.$eval('.ct-mail', (a) => a.getAttribute('href'))).startsWith('mailto:you@example.com'), `${tag}: direct address is the site email`)

  await page.click('.ct-send')
  await page.waitForTimeout(100)
  check((await page.$('.ct-err[role="alert"]')) !== null, `${tag}: empty send names what is missing`)
  const afterError = await page.evaluate(() => ({ focus: document.activeElement?.getAttribute('name'), invalid: [...document.querySelectorAll('.ct-form [aria-invalid="true"]')].length }))
  check(afterError.focus === 'firstName' && afterError.invalid === 4, `${tag}: the first empty field takes focus, all four are marked (${JSON.stringify(afterError)})`)
  const fontSize = await page.$eval('.ct-field input', (i) => parseFloat(getComputedStyle(i).fontSize))
  check(fontSize >= 16, `${tag}: inputs are 16px+ so iOS does not zoom on focus (${fontSize})`)
  if (tag === 'desk-dark') await shot(page, `${tag}-error`)

  await page.fill('input[name="firstName"]', 'Dana')
  await page.fill('input[name="lastName"]', 'Reyes')
  await page.fill('input[name="email"]', 'dana@example.com')
  await page.fill('textarea[name="message"]', 'A short note about the project.')
  await page.click('.ct-send')
  await page.waitForTimeout(300)
  const mailto = await page.evaluate(() => window.__mailto)
  check(mailto?.startsWith('mailto:you@example.com?subject=Project%20inquiry&body=Dana%20Reyes'), `${tag}: send opens the mail app, addressed and laid out`)
  check((await page.$('.ct-done h3')) !== null && (await page.evaluate(() => document.activeElement?.tagName)) === 'H3', `${tag}: sent state shows and takes focus`)
  check((await page.$eval('.ct-done__fallback a', (a) => a.getAttribute('href'))) === 'mailto:you@example.com', `${tag}: sent state also gives the address (no mail app opened)`)
  await page.click('.ct-done__actions .pg-btn:last-child')
  await page.waitForTimeout(150)
  check((await page.$('.ct-form')) !== null && (await page.evaluate(() => document.activeElement?.getAttribute('name'))) === 'firstName', `${tag}: Write another brings the form back, focus on the first field`)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  check(!overflow, `${tag}: no sideways scroll`)
  check(errors.length === 0, `${tag}: no page errors ${errors.join(' | ')}`)
  await shot(page, tag)
  await context.close()
}

/* ---------- Home: Contact is the last section, after Showcase; Hire Me glides to it ---------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#contact .ct-form')
  const home = await page.evaluate(() => ({
    order: [...document.querySelectorAll('.app-main__inner section[id]')].map((s) => s.id).filter((id) => ['showcase', 'contact'].includes(id)),
    last: [...document.querySelectorAll('.app-main__inner > * > section[id], .app-main__inner > section[id]')].at(-1)?.id,
    h1: document.querySelectorAll('h1').length,
    h2: document.querySelector('#contact-title')?.tagName,
  }))
  check(home.order.join(',') === 'showcase,contact', `home: Contact follows Showcase (${home.order})`)
  check(home.h1 === 1 && home.h2 === 'H2', `home: still one h1, Contact heads with an h2 (${home.h1}, ${home.h2})`)
  await page.waitForTimeout(800)
  await page.click('.hero__cta')
  await page.waitForTimeout(2600) // the Lenis glide runs the whole page
  const top = await page.$eval('#contact', (el) => Math.round(el.getBoundingClientRect().top))
  check(Math.abs(top) < 40, `home: Hire Me glides to Contact (section top ${top}px)`)

  // From another page, the sidebar Contact entry lands Home exactly on the section (useHashLanding).
  await page.goto(`${BASE}/proof`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  await page.click('.sb-float [data-nav-id="contact"]')
  await page.waitForTimeout(2000)
  const landed = await page.evaluate(() => ({ url: location.pathname + location.hash, top: Math.round(document.getElementById('contact').getBoundingClientRect().top) }))
  check(landed.url === '/#contact' && Math.abs(landed.top) < 40, `home: /proof -> sidebar Contact lands on the section (${JSON.stringify(landed)})`)
  check(errors.length === 0, `home: no page errors ${errors.join(' | ')}`)
  await page.close()
}

await browser.close()
console.log(failures.length ? `\n${failures.length} FAILED` : '\nALL PASS')
process.exit(failures.length ? 1 : 0)

// Built-site regression checks. Run npm run build first.
// Optional: PLAYWRIGHT_CHROMIUM_EXECUTABLE and PLAYWRIGHT_CHROMIUM_ARGS for hosted runners.
import { chromium } from 'playwright'
import { preview } from 'vite'
import { mkdirSync } from 'node:fs'
import assert from 'node:assert/strict'

const server = await preview({ preview: { host: '127.0.0.1', port: 5192, strictPort: true } })
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
  proxy: process.env.PLAYWRIGHT_PROXY ? { server: process.env.PLAYWRIGHT_PROXY, bypass: '127.0.0.1,localhost' } : undefined,
  args: JSON.parse(process.env.PLAYWRIGHT_CHROMIUM_ARGS || '[]'),
})
const url = 'http://127.0.0.1:5192/portfolio-v2/'
mkdirSync('scripts/out', { recursive: true })
const errors = []
const check = (value, message) => { assert.ok(value, message); console.log('PASS', message) }
const ids = ['top', 'manifesto', 'automation', 'work', 'services', 'about', 'proof', 'showcase', 'contact']
const settle = page => page.waitForTimeout(900)
const dock = page => page.getByRole('navigation', { name: 'Page sections' })
const jump = async (page, index) => {
  await dock(page).getByRole('button', { name: /Sections/ }).click()
  await page.locator('.section-picker__list > button').nth(index).click()
  await page.waitForFunction(id => { const top = document.getElementById(id).getBoundingClientRect().top; return top >= 55 && top <= 76 }, ids[index], {timeout: 5000})
  await page.waitForTimeout(100)
  const top = await page.locator(`#${ids[index]}`).evaluate(el => el.getBoundingClientRect().top)
  check(top >= 55 && top <= 76, `section picker lands ${ids[index]} below the header (${Math.round(top)}px)`)
  check(await dock(page).locator('strong').innerText() === await page.locator('.section-picker__list strong').nth(index).innerText(), `current section updates to ${ids[index]}`)
}

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, ignoreHTTPSErrors: process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === '1' })
  const page = await context.newPage()
  const requests = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('request', r => requests.push(r.url()))
  await page.goto(url)
  await page.evaluate(() => document.fonts.ready)
  // Allow the existing public-content request to complete or use its 12-second fallback.
  await page.waitForTimeout(13000)
  for (const [width, height] of [[320,568],[360,800],[390,844],[430,932],[768,1024],[844,390]]) {
    await page.setViewportSize({ width, height }); await settle(page)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      pinned: getComputedStyle(document.querySelector('.fl__pin')).position,
      stacked: getComputedStyle(document.querySelector('.sv__item')).position,
      heroFits: [...document.querySelectorAll('.hero__line')].every(el => el.getBoundingClientRect().right <= innerWidth && el.getBoundingClientRect().left >= 0),
      buttons: [...document.querySelectorAll('.section-dock > button')].every(el => el.getBoundingClientRect().width >= 44 && el.getBoundingClientRect().height >= 44),
    }))
    check(!layout.overflow && layout.heroFits, `${width}×${height}: content fits without sideways scrolling`)
    check(layout.pinned === 'static' && layout.stacked === 'static', `${width}×${height}: natural mobile reading flow`)
    check(layout.buttons, `${width}×${height}: dock controls have 44px touch targets`)
    await jump(page, 3)
    await page.screenshot({ path: `scripts/out/mobile-${width}.png` })
  }
  await page.setViewportSize({ width:390, height:844 }); await settle(page)
  for (let i = 0; i < ids.length; i++) await jump(page, i)
  await dock(page).getByRole('button', { name: 'Previous section', exact: true }).click(); await settle(page)
  check(await dock(page).locator('strong').innerText() === 'Showcase', 'previous section moves backward')
  await dock(page).getByRole('button', { name: 'Next section', exact: true }).click(); await settle(page)
  check(await dock(page).locator('strong').innerText() === 'Contact', 'next section moves forward')
  await dock(page).getByRole('button', { name: 'Back to top', exact: true }).click(); await page.waitForFunction(() => scrollY <= 2, undefined, { timeout: 4000 })
  check(await page.evaluate(() => scrollY) <= 2, 'back to top reaches the beginning')
  await dock(page).getByRole('button', { name: /Sections/ }).click()
  await page.keyboard.press('Tab')
  check(await page.evaluate(() => document.activeElement.closest('#section-picker') !== null), 'section picker contains keyboard focus')
  await page.keyboard.press('Escape'); await settle(page)
  check(await page.evaluate(() => !document.documentElement.dataset.scrollLocked), 'Escape releases the section picker scroll lock')
  await page.getByRole('button',{name:'Open menu',exact:true}).click();await settle(page)
  await page.keyboard.press('Shift+Tab')
  check(await page.evaluate(() => document.activeElement.closest('#mobile-drawer') !== null), 'mobile menu traps keyboard focus')
  await page.locator('#mobile-drawer').getByRole('link',{name:/Projects/}).click();await settle(page)
  check(await page.locator('#work').evaluate(el => Math.abs(el.getBoundingClientRect().top - 72) < 5), 'drawer links scroll after the menu unlocks')
  await page.locator('.wb__tile').first().click(); await settle(page)
  check(await page.locator('dialog.sh').evaluate(el => el.open), 'project detail opens on mobile')
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.section-dock')).visibility === 'hidden'), 'dock stays out of project dialog')
  await page.locator('.sh__close').click(); await settle(page)
  check(await page.evaluate(() => !document.documentElement.dataset.scrollLocked), 'project close restores scrolling')
  await jump(page,2)
  await page.getByRole('button',{name:'Next stage',exact:true}).click()
  check((await page.locator('.fl-mobile__controls > span').innerText()).startsWith('02'), 'process can be explored with taps')
  await page.locator('#process-stage').selectOption('10');await page.locator('#process-stage').blur()
  check((await page.locator('.fl-mobile__controls > span').innerText()).startsWith('11'), 'all process stages are available in the picker')
  await jump(page,7)
  const rooms = await page.locator('#showcase-project option').count()
  for(let i=0;i<rooms;i++) {
    await page.locator('#showcase-project').selectOption(String(i))
    check(await page.locator('.kt-room:visible').count() === 1, `showcase project ${i+1}: exactly one readable panel`)
  }
  await page.locator('#showcase-project').blur()
  await jump(page,8)
  const input=page.locator('#contact input[type="email"]');await input.focus()
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.section-dock')).visibility === 'hidden'), 'dock hides while filling the contact form')
  await input.blur()
  await page.evaluate(() => window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await settle(page)
  const footerClear=await page.evaluate(()=>document.querySelector('.site-foot nav').getBoundingClientRect().bottom<document.querySelector('.section-dock').getBoundingClientRect().top)
  check(footerClear,'footer links remain above the dock')
  await page.emulateMedia({reducedMotion:'reduce'})
  await dock(page).getByRole('button',{name:'Back to top',exact:true}).click();await page.waitForTimeout(80)
  check(await page.evaluate(()=>scrollY)<=2,'reduced-motion navigation jumps without animation')
  check(!requests.some(u=>/assets\/(signal-flow|lenis)-/.test(u)), 'mobile skips WebGL and smooth-wheel bundles')
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.screenshot({path:'scripts/out/mobile-final-hero.png'})
  await dock(page).getByRole('button',{name:/Sections/}).click();await settle(page)
  await page.screenshot({path:'scripts/out/mobile-final-picker.png'})
  await context.close()

  const desktop=await browser.newContext({viewport:{width:1440,height:900}, ignoreHTTPSErrors: process.env.PLAYWRIGHT_IGNORE_HTTPS_ERRORS === '1'})
  const dp=await desktop.newPage();dp.on('pageerror',e=>errors.push(e.message));await dp.goto(url);await dp.waitForTimeout(1500)
  check(await dp.locator('.section-dock').count()===0,'desktop retains sidebar navigation')
  check(await dp.locator('.fl-mobile').count()===0,'desktop retains its workflow diagram')
  check(await dp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'desktop has no sideways overflow')
  await dp.screenshot({path:'scripts/out/desktop-final.png'})
  await dp.setViewportSize({width:390,height:844});await settle(dp)
  check(await dp.locator('.fl-mobile').count()===1,'resizing desktop to phone switches workflow layouts')
  await dp.setViewportSize({width:1440,height:900});await settle(dp)
  check(await dp.locator('.fl').evaluate(el=>el.hasAttribute('data-live')),'resizing back restores desktop animation')
  check(errors.length===0,`no uncaught application errors: ${errors.join(' | ')}`)
  await desktop.close()
  console.log('ALL MOBILE NAVIGATION CHECKS PASSED')
} finally {
  await browser.close()
  await new Promise(resolve=>server.httpServer.close(resolve))
}

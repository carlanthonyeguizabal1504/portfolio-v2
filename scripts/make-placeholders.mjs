// Writes every placeholder picture, video and demo page listed in scripts/placeholders/*.json under public/.
// Usage: node scripts/make-placeholders.mjs
// Idempotent: every run rewrites every listed file. Order: pages, full-size pictures and tool marks, videos,
// captures (need pages), resizes (need their source). Bad entries or an unknown kind abort before anything is written.
// Pictures are drawn in one headless Chromium page (scripts/placeholders/lib/draw.js) in the site palette.
// Video needs ffmpeg on PATH; without it video entries are skipped with a warning.
import { chromium } from 'playwright'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { renderPage, PAGE_VARIANTS } from './placeholders/lib/pages.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LIB = join(ROOT, 'scripts', 'placeholders', 'lib')
const FONTS = join(ROOT, 'public', 'fonts')
// MANIFEST_DIR / OUT_DIR override the defaults (used to test the generator without touching public/).
const PUBLIC = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : join(ROOT, 'public')
const MANIFESTS = process.env.MANIFEST_DIR ? resolve(process.env.MANIFEST_DIR) : join(ROOT, 'scripts', 'placeholders')
const sizedKinds = ['screen', 'phone', 'popup', 'illustration', 'poster', 'logo', 'mark', 'badge', 'avatar']
const KINDS = new Set([...sizedKinds, 'tool', 'resize', 'video', 'page', 'capture'])
const RASTER = new Set(['.webp', '.png', '.jpg', '.jpeg'])

// Reads width/height from a PNG, WebP or JPEG buffer; null when unknown.
export function readDimensions(buf) {
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const t = buf.toString('ascii', 12, 16)
    if (t === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
    if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 } }
    if (t === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue }
      const m = buf[i + 1]
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      i += 2 + buf.readUInt16BE(i + 2)
    }
  }
  return null
}

function loadEntries() {
  const files = readdirSync(MANIFESTS).filter((f) => f.endsWith('.json')).sort()
  if (!files.length) throw new Error(`no manifests in ${MANIFESTS}`)
  const entries = []
  for (const f of files) {
    let list
    try { list = JSON.parse(readFileSync(join(MANIFESTS, f), 'utf8')) } catch (err) { throw new Error(`${f}: invalid JSON (${err.message})`) }
    if (!Array.isArray(list)) throw new Error(`${f}: must be a JSON array`)
    list.forEach((e, i) => entries.push({ ...e, _src: `${f}[${i}]` }))
  }
  return entries
}

function validate(entries) {
  const errs = [], seen = new Map()
  for (const e of entries) {
    const bad = (m) => errs.push(`${e._src} ${e.path ?? '(no path)'}: ${m}`)
    if (typeof e.path !== 'string' || !e.path || e.path.startsWith('/') || e.path.includes('..') || e.path.includes('\\')) { bad('path must be a relative forward-slash path under public/'); continue }
    if (!KINDS.has(e.kind)) { bad(`unknown kind "${e.kind}"`); continue }
    if (seen.has(e.path)) bad(`duplicate of ${seen.get(e.path)}`)
    seen.set(e.path, e._src)
    const ext = extname(e.path).toLowerCase()
    const needsSize = [...sizedKinds, 'resize', 'video', 'capture'].includes(e.kind)
    if (needsSize && !(Number.isInteger(e.width) && e.width > 0 && Number.isInteger(e.height) && e.height > 0)) bad('width and height must be positive integers')
    if ([...sizedKinds, 'resize', 'capture'].includes(e.kind) && !RASTER.has(ext)) bad(`extension ${ext} is not webp/png/jpg`)
    if (e.kind === 'tool' && ext !== '.svg') bad('tool must be .svg')
    if (e.kind === 'video' && ext !== '.mp4') bad('video must be .mp4')
    if (e.kind === 'page' && ext !== '.html') bad('page must be .html')
    if (e.kind === 'page' && !PAGE_VARIANTS.includes(e.variant)) bad(`page variant must be one of ${PAGE_VARIANTS.join(', ')}`)
    if (e.kind === 'resize' && typeof e.from !== 'string') bad('resize needs "from"')
    if (e.kind === 'capture' && typeof e.from !== 'string') bad('capture needs "from" (a page path)')
    if (e.kind === 'video' && !(e.seconds > 0)) bad('video needs "seconds"')
    if (e.kind === 'screen' && e.variant && !['dashboard', 'canvas', 'list', 'form'].includes(e.variant)) bad(`screen variant "${e.variant}" unknown`)
  }
  const pageSet = new Set(entries.filter((e) => e.kind === 'page').map((e) => e.path))
  const all = new Set(seen.keys())
  for (const e of entries) {
    if (e.kind === 'capture' && !pageSet.has(e.from)) errs.push(`${e._src} ${e.path}: capture source ${e.from} is not a page entry`)
    if (e.kind === 'resize' && !all.has(e.from)) errs.push(`${e._src} ${e.path}: resize source ${e.from} is not listed in any manifest`)
  }
  if (errs.length) throw new Error(`manifest errors:\n  ${errs.join('\n  ')}`)
}

const out = (rel) => join(PUBLIC, rel)
const dataUrlBuf = (u) => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64')
const mime = (ext) => (ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg')
function write(rel, data, note = '') {
  mkdirSync(dirname(out(rel)), { recursive: true })
  writeFileSync(out(rel), data)
  const dim = RASTER.has(extname(rel).toLowerCase()) ? readDimensions(Buffer.isBuffer(data) ? data : Buffer.from(data)) : null
  console.log(`wrote ${rel}${dim ? `  ${dim.width}x${dim.height}` : ''}  ${(statSync(out(rel)).size / 1024).toFixed(1)} KB${note}`)
  return dim
}
function checkSize(e, dim) {
  if (!dim || dim.width !== e.width || dim.height !== e.height) throw new Error(`${e.path}: wrote ${dim ? `${dim.width}x${dim.height}` : 'unreadable image'}, expected ${e.width}x${e.height}`)
}

// 12 distinct geometric tool marks: different shape and muted hue each, 64x64, letter readable at 24px.
const TOOL_SHAPES = [
  (c) => `<circle cx="32" cy="32" r="29" fill="${c}"/>`,
  (c) => `<rect x="5" y="5" width="54" height="54" rx="14" fill="${c}"/>`,
  (c) => `<path d="M32 4 61 56H3z" fill="${c}" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`,
  (c) => `<path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill="${c}"/>`,
  (c) => `<path d="M32 3 61 32 32 61 3 32z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
  (c) => `<path d="M32 3 60 24 49 58H15L4 24z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
  (c) => `<rect x="12" y="12" width="40" height="40" rx="9" fill="${c}" transform="rotate(45 32 32)"/>`,
  (c) => `<rect x="3" y="13" width="58" height="38" rx="19" fill="${c}"/>`,
  (c) => `<path d="M32 3 56 12v20c0 14-10 24-24 29C18 56 8 46 8 32V12z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
  (c) => `<path d="M22 4h20v18h18v20H42v18H22V42H4V22h18z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
  (c) => `<path d="M21 4h22l17 17v22L43 60H21L4 43V21z" fill="${c}"/>`,
  (c) => `<path d="M4 50a28 28 0 0 1 56 0v6H4z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
]
const TOOL_HUES = ['#2d78c2', '#47795f', '#a85a3a', '#34767f', '#85661c', '#4f6587', '#7a6a9a', '#a0566a', '#5f7f3f', '#3f6f9a', '#9a6a3a', '#5a6f78']
function toolSvg(e) {
  const label = String(e.label || '?').slice(0, 2)
  const num = e.path.match(/(\d+)\.svg$/)
  const k = num ? (Number(num[1]) - 1 + 12) % 12 : label.toUpperCase().charCodeAt(0) % 12
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${label}">${TOOL_SHAPES[k](TOOL_HUES[k])}<text x="32" y="${k === 11 ? 46 : 33}" text-anchor="middle" dominant-baseline="${k === 11 ? 'alphabetic' : 'central'}" font-family="Geist,system-ui,-apple-system,Segoe UI,Arial,sans-serif" font-weight="700" font-size="28" fill="#fff">${label}</text></svg>\n`
}

function hasFfmpeg() { return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0 }

async function main() {
  const entries = loadEntries()
  validate(entries)
  const byKind = (...k) => entries.filter((e) => k.includes(e.kind))
  const browser = await chromium.launch()
  const tmp = mkdtempSync(join(tmpdir(), 'placeholders-'))
  try {
    const engine = await browser.newPage()
    await engine.setContent('<!doctype html><meta charset="utf-8"><body></body>')
    await engine.addScriptTag({ path: join(LIB, 'draw.js') })
    const font = (f) => readFileSync(join(FONTS, f)).toString('base64')
    await engine.evaluate(async (fonts) => {
      for (const [family, b64, weight] of fonts) {
        const ff = new FontFace(family, `url(data:font/woff2;base64,${b64})`, { weight })
        document.fonts.add(await ff.load())
      }
    }, [['Geist', font('geist-var.woff2'), '100 900'], ['IBM Plex Mono', font('ibm-plex-mono-400.woff2'), '400'], ['IBM Plex Mono', font('ibm-plex-mono-500.woff2'), '500']])
    const fromImage = (buf, ext, w, h, outExt) => engine.evaluate(([s, a, b, x]) => window.__fromImage(s, a, b, x), [`data:${mime(ext)};base64,${buf.toString('base64')}`, w, h, outExt])

    // 1. pages
    byKind('page').forEach((e, i) => write(e.path, renderPage(e, i)))

    // 2. full-size pictures and tool marks
    for (const e of byKind(...sizedKinds)) {
      const url = await engine.evaluate((x) => window.__render(x), e)
      checkSize(e, write(e.path, dataUrlBuf(url)))
    }
    for (const e of byKind('tool')) write(e.path, toolSvg(e))

    // 3. videos
    const videos = byKind('video')
    if (videos.length && !hasFfmpeg()) console.warn(`WARNING: ffmpeg not found on PATH, skipping ${videos.length} video entr${videos.length === 1 ? 'y' : 'ies'}`)
    else for (const e of videos) {
      const layer = async (name, w = e.width, h = e.height) => { const f = join(tmp, `${name}-${w}x${h}.png`); writeFileSync(f, dataUrlBuf(await engine.evaluate((x) => window.__render(x), { ...e, width: w, height: h, layer: name }))); return f }
      const base = await layer('base'), front = await layer('front')
      const bs = Math.round(e.height * 1.1), blobF = await layer('blob', bs, bs)
      const T = e.seconds, ph = `2*PI*t/${T}`
      const fc = `[1]split[b1][b2];[0][b1]overlay=x='(main_w-overlay_w)/2+${Math.round(e.width * 0.2)}*sin(${ph})':y='(main_h-overlay_h)/2-${Math.round(e.height * 0.12)}*cos(${ph})':shortest=1[a];` +
        `[a][b2]overlay=x='(main_w-overlay_w)/2-${Math.round(e.width * 0.24)}*cos(${ph})':y='(main_h-overlay_h)/2+${Math.round(e.height * 0.16)}*sin(${ph})':shortest=1[b];` +
        `[b][2]overlay=x=0:y='${Math.max(2, Math.round(e.height * 0.008))}*sin(${ph})':shortest=1,format=yuv420p`
      mkdirSync(dirname(out(e.path)), { recursive: true })
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-framerate', '24', '-i', base, '-loop', '1', '-framerate', '24', '-i', blobF, '-loop', '1', '-framerate', '24', '-i', front,
        '-filter_complex', fc, '-t', String(T), '-r', '24', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out(e.path)], { encoding: 'utf8' })
      if (r.status !== 0) throw new Error(`${e.path}: ffmpeg failed\n${r.stderr}`)
      console.log(`wrote ${e.path}  ${e.width}x${e.height}  ${T}s  ${(statSync(out(e.path)).size / 1024).toFixed(1)} KB`)
    }

    // 4. captures of the pages
    const captures = byKind('capture')
    if (captures.length) {
      const dsf = (e) => e.width / 1440
      for (const e of captures) {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dsf(e) })
        const page = await ctx.newPage()
        const external = []
        page.on('request', (r) => { if (!/^(file|data|about):/.test(r.url())) external.push(r.url()) })
        await page.goto(pathToFileURL(out(e.from)).href)
        const png = await page.screenshot({ type: 'png' })
        await ctx.close()
        if (external.length) throw new Error(`${e.from}: page made external requests: ${external.join(', ')}`)
        const url = await fromImage(png, '.png', e.width, e.height, extname(e.path).toLowerCase().slice(1))
        checkSize(e, write(e.path, dataUrlBuf(url)))
      }
    }

    // 5. resizes, ordered so a source is always written first
    let pending = byKind('resize')
    while (pending.length) {
      const ready = pending.filter((e) => existsSync(out(e.from)) && !pending.some((o) => o.path === e.from))
      if (!ready.length) throw new Error(`resize sources never produced: ${pending.map((e) => `${e.path} <- ${e.from}`).join(', ')}`)
      for (const e of ready) {
        const url = await fromImage(readFileSync(out(e.from)), extname(e.from).toLowerCase(), e.width, e.height, extname(e.path).toLowerCase().slice(1))
        checkSize(e, write(e.path, dataUrlBuf(url)))
      }
      pending = pending.filter((e) => !ready.includes(e))
    }
    console.log(`done: ${entries.length} entries`)
  } finally {
    await browser.close()
    rmSync(tmp, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(`FAIL: ${err.message}`); process.exit(1) })
}

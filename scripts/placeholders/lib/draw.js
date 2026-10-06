// Browser-side drawing engine for scripts/make-placeholders.mjs. Runs inside one headless Chromium page.
// Everything is drawn with canvas 2D in the site palette (see src/styles/tokens.css) and exported by file extension.
// Entry points: window.__render(entry) and window.__fromImage(dataUrl, w, h, ext). Both return a data URL.
(() => {
  const C = {
    accent: '#2d78c2', accentInk: '#2566a6', accentDeep: '#1b4f86', accentSoft: 'rgba(45,120,194,.10)',
    bg: '#f0f8ff', surface: '#ffffff', s2: '#e6f0fa', s3: '#d9e7f5', ink: '#0e1b2a', ink2: '#44566b', ink3: '#566779',
    line: 'rgba(14,27,42,.10)', lineStrong: 'rgba(14,27,42,.16)', strong: 'rgba(14,27,42,.30)', soft: 'rgba(14,27,42,.14)',
    onyx: '#0a0a0a', onyx2: '#141414', onyx3: '#1e1e1e',
  }
  const TAU = Math.PI * 2
  // Muted hues (saturation well under 80%) for logos and secondary marks, so a set does not read as one colour.
  const HUES = ['#2d78c2', '#4a8266', '#b0613f', '#3a808a', '#8f6d1f', '#556b8c', '#7a6a9a', '#a0566a']

  const hash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h }
  const mk = (w, h) => {
    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const g = cv.getContext('2d')
    g.imageSmoothingEnabled = true
    g.imageSmoothingQuality = 'high'
    return [cv, g]
  }
  const rpath = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))) }
  const box = (g, x, y, w, h, r, o = {}) => {
    if (o.fill) {
      g.save()
      if (o.shadow) { g.shadowBlur = o.shadow[0]; g.shadowOffsetY = o.shadow[1]; g.shadowColor = o.shadow[2] }
      rpath(g, x, y, w, h, r); g.fillStyle = o.fill; g.fill()
      g.restore()
    }
    if (o.stroke) { rpath(g, x, y, w, h, r); g.strokeStyle = o.stroke; g.lineWidth = o.lw || 1; g.stroke() }
  }
  const bar = (g, x, y, w, h, fill) => box(g, x, y, w, h, h / 2, { fill })
  const dot = (g, x, y, r, fill) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = fill; g.fill() }
  const vgrad = (g, y0, y1, a, b) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); return gr }

  const MONO = '"IBM Plex Mono", ui-monospace, monospace'
  const GEIST = 'Geist, system-ui, sans-serif'

  const captionText = (e, W, H) => {
    const base = e.label || 'Your image'
    return base.includes('×') ? base : `${base} · ${W} × ${H}`
  }
  // Small mono pill: accent dot + label. dark = for the Onyx ground, grey = for transparent cutouts.
  const caption = (g, cx, cy, text, u, mode = 'light') => {
    const fs = Math.max(9, Math.round(15 * u))
    g.font = `500 ${fs}px ${MONO}`
    const tw = g.measureText(text).width
    const pad = fs * 1.1, h = fs * 2.3, w = tw + pad * 2 + fs * 1.1
    const x = cx - w / 2, y = cy - h / 2
    if (mode === 'dark') box(g, x, y, w, h, h / 2, { fill: 'rgba(255,255,255,.07)', stroke: 'rgba(255,255,255,.14)', lw: Math.max(1, u) })
    else if (mode === 'grey') box(g, x, y, w, h, h / 2, { fill: 'rgba(127,143,163,.14)', stroke: 'rgba(127,143,163,.35)', lw: Math.max(1, u) })
    else box(g, x, y, w, h, h / 2, { fill: 'rgba(255,255,255,.96)', stroke: C.lineStrong, lw: Math.max(1, u), shadow: [18 * u, 6 * u, 'rgba(20,60,110,.16)'] })
    dot(g, x + pad, cy, fs * 0.28, mode === 'dark' ? '#5b9bd5' : C.accent)
    g.fillStyle = mode === 'dark' ? '#a9b8c8' : mode === 'grey' ? '#7d8fa3' : C.ink3
    g.textBaseline = 'middle'
    g.textAlign = 'left'
    g.fillText(text, x + pad + fs * 1.1, cy + fs * 0.04)
  }

  // ---------- screen ----------
  function drawScreen(g, W, H, e, opts = {}) {
    const u = W / 1600
    if (!opts.transparent) { g.fillStyle = vgrad(g, 0, H, C.bg, C.s2); g.fillRect(0, 0, W, H) }
    const m = Math.round(40 * u), x = m, y = m, w = W - 2 * m, h = H - 2 * m
    box(g, x, y, w, h, 20 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u), shadow: [60 * u, 24 * u, 'rgba(20,60,110,.18)'] })
    g.save()
    rpath(g, x, y, w, h, 20 * u); g.clip()
    const tb = 68 * u
    g.fillStyle = C.line; g.fillRect(x, y + tb, w, Math.max(1, u))
    box(g, x + 28 * u, y + tb / 2 - 14 * u, 28 * u, 28 * u, 8 * u, { fill: C.accent })
    bar(g, x + 70 * u, y + tb / 2 - 6 * u, 110 * u, 12 * u, C.strong)
    box(g, x + w / 2 - 170 * u, y + tb / 2 - 18 * u, 340 * u, 36 * u, 18 * u, { fill: C.s2 })
    bar(g, x + w / 2 - 140 * u, y + tb / 2 - 4 * u, 120 * u, 8 * u, C.soft)
    dot(g, x + w - 52 * u, y + tb / 2, 17 * u, C.s3)
    bar(g, x + w - 140 * u, y + tb / 2 - 5 * u, 64 * u, 10 * u, C.soft)
    const sw = Math.min(250 * u, w * 0.2)
    g.fillStyle = '#f7fbff'; g.fillRect(x, y + tb + Math.max(1, u), sw, h - tb)
    g.fillStyle = C.line; g.fillRect(x + sw, y + tb, Math.max(1, u), h - tb)
    for (let i = 0; i < 8; i++) {
      const ry = y + tb + 28 * u + i * 48 * u
      if (ry + 40 * u > y + h) break
      if (i === 1) box(g, x + 16 * u, ry - 8 * u, sw - 32 * u, 40 * u, 12 * u, { fill: C.accentSoft })
      box(g, x + 30 * u, ry, 22 * u, 22 * u, 7 * u, { fill: i === 1 ? C.accent : C.s3 })
      bar(g, x + 68 * u, ry + 6 * u, (84 + ((i * 29) % 58)) * u, 10 * u, i === 1 ? C.strong : C.soft)
    }
    const R = { cx: x + sw + 30 * u, cy: y + tb + 30 * u, cw: w - sw - 60 * u, ch: h - tb - 60 * u }
    const variant = e.variant || 'dashboard'
    ;({ dashboard, canvas: canvasV, list, form }[variant] || dashboard)(g, R, u)
    g.restore()
    if (!opts.noCaption) caption(g, W / 2, H - m - 34 * u, captionText(e, W, H), u)
  }

  function dashboard(g, R, u) {
    const { cx, cy, cw, ch } = R
    bar(g, cx, cy, 220 * u, 22 * u, C.strong)
    bar(g, cx, cy + 34 * u, 320 * u, 11 * u, C.soft)
    box(g, cx + cw - 150 * u, cy - 2 * u, 150 * u, 44 * u, 14 * u, { fill: C.accent })
    bar(g, cx + cw - 118 * u, cy + 16 * u, 86 * u, 10 * u, 'rgba(255,255,255,.75)')
    const y0 = cy + 76 * u, sh = Math.min(132 * u, ch * 0.2), gap = 20 * u, sw3 = (cw - 2 * gap) / 3
    for (let i = 0; i < 3; i++) {
      const sx = cx + i * (sw3 + gap)
      box(g, sx, y0, sw3, sh, 16 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u), shadow: [14 * u, 4 * u, 'rgba(20,60,110,.07)'] })
      bar(g, sx + 22 * u, y0 + 22 * u, 90 * u, 10 * u, C.soft)
      bar(g, sx + 22 * u, y0 + 48 * u, (110 + i * 18) * u, 28 * u, C.strong)
      g.beginPath()
      const pts = [0.7, 0.5, 0.6, 0.3, 0.42, 0.18]
      pts.forEach((p, k) => { const px = sx + sw3 - 150 * u + k * 26 * u, py = y0 + 24 * u + p * (sh - 48 * u); k ? g.lineTo(px, py) : g.moveTo(px, py) })
      g.strokeStyle = C.accent; g.lineWidth = 3 * u; g.lineJoin = 'round'; g.stroke()
    }
    const y1 = y0 + sh + gap, h1 = cy + ch - y1 - 56 * u
    const lw = (cw - gap) * 0.64
    box(g, cx, y1, lw, h1, 16 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u) })
    bar(g, cx + 24 * u, y1 + 24 * u, 150 * u, 12 * u, C.strong)
    const gx = cx + 24 * u, gw = lw - 48 * u, gy = y1 + 64 * u, gh = h1 - 96 * u
    for (let k = 0; k < 4; k++) { g.fillStyle = C.line; g.fillRect(gx, gy + (gh * k) / 3, gw, Math.max(1, u)) }
    const ys = [0.78, 0.6, 0.66, 0.4, 0.5, 0.28, 0.36, 0.14]
    const P = ys.map((v, k) => [gx + (gw * k) / (ys.length - 1), gy + gh * v])
    const area = new Path2D()
    area.moveTo(P[0][0], gy + gh)
    P.forEach(([px, py]) => area.lineTo(px, py))
    area.lineTo(P[P.length - 1][0], gy + gh)
    area.closePath()
    g.fillStyle = vgrad(g, gy, gy + gh, 'rgba(45,120,194,.22)', 'rgba(45,120,194,0)')
    g.fill(area)
    g.beginPath(); P.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py)))
    g.strokeStyle = C.accent; g.lineWidth = 3.5 * u; g.lineJoin = 'round'; g.stroke()
    P.forEach(([px, py], k) => { if (k % 2 === 1) { dot(g, px, py, 6 * u, C.surface); g.beginPath(); g.arc(px, py, 6 * u, 0, TAU); g.strokeStyle = C.accent; g.lineWidth = 3 * u; g.stroke() } })
    const rx = cx + lw + gap, rw = cw - lw - gap
    box(g, rx, y1, rw, h1, 16 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u) })
    bar(g, rx + 24 * u, y1 + 24 * u, 110 * u, 12 * u, C.strong)
    const rr = Math.min(rw * 0.24, h1 * 0.26), ccx = rx + rw / 2, ccy = y1 + h1 * 0.52
    g.lineWidth = 22 * u; g.lineCap = 'round'
    g.beginPath(); g.arc(ccx, ccy, rr, 0, TAU); g.strokeStyle = C.s3; g.stroke()
    g.beginPath(); g.arc(ccx, ccy, rr, -Math.PI / 2, -Math.PI / 2 + TAU * 0.68); g.strokeStyle = C.accent; g.stroke()
    g.lineCap = 'butt'
    bar(g, ccx - 34 * u, ccy - 9 * u, 68 * u, 18 * u, C.strong)
  }

  function canvasV(g, R, u) {
    const { cx, cy, cw, ch } = R
    g.fillStyle = 'rgba(14,27,42,.13)'
    for (let px = cx - 10 * u; px < cx + cw + 30 * u; px += 30 * u) for (let py = cy - 10 * u; py < cy + ch + 30 * u; py += 30 * u) { g.beginPath(); g.arc(px, py, 1.7 * u, 0, TAU); g.fill() }
    const nw = 230 * u, nh = 92 * u
    const N = [[0, 0.42], [0.24, 0.1], [0.24, 0.72], [0.5, 0.42], [0.74, 0.14], [0.74, 0.68]]
    const pos = N.map(([fx, fy]) => [cx + fx * (cw - nw), cy + fy * (ch - nh - 70 * u)])
    const E = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]]
    g.lineWidth = 2.6 * u
    for (const [a, b] of E) {
      const [ax, ay] = pos[a], [bx, by] = pos[b]
      const x1 = ax + nw, y1 = ay + nh / 2, x2 = bx, y2 = by + nh / 2, k = (x2 - x1) * 0.5
      g.beginPath(); g.moveTo(x1, y1); g.bezierCurveTo(x1 + k, y1, x2 - k, y2, x2, y2)
      g.strokeStyle = 'rgba(14,27,42,.26)'; g.stroke()
      dot(g, x1, y1, 5 * u, C.accent); dot(g, x2, y2, 5 * u, C.accent)
    }
    pos.forEach(([nx, ny], i) => {
      const t = i === 0
      box(g, nx, ny, nw, nh, 18 * u, { fill: t ? C.accent : C.surface, stroke: t ? undefined : C.lineStrong, lw: Math.max(1, u), shadow: [24 * u, 8 * u, 'rgba(20,60,110,.14)'] })
      box(g, nx + 20 * u, ny + nh / 2 - 22 * u, 44 * u, 44 * u, 13 * u, { fill: t ? 'rgba(255,255,255,.22)' : C.accentSoft })
      box(g, nx + 31 * u, ny + nh / 2 - 11 * u, 22 * u, 22 * u, 6 * u, { fill: t ? '#fff' : C.accent })
      bar(g, nx + 80 * u, ny + nh / 2 - 16 * u, (88 + (i % 3) * 20) * u, 12 * u, t ? 'rgba(255,255,255,.92)' : C.strong)
      bar(g, nx + 80 * u, ny + nh / 2 + 6 * u, 60 * u, 9 * u, t ? 'rgba(255,255,255,.55)' : C.soft)
    })
    const zx = cx + cw - 124 * u, zy = cy + ch - 56 * u
    box(g, zx, zy, 124 * u, 44 * u, 14 * u, { fill: C.surface, stroke: C.lineStrong, lw: Math.max(1, u) })
    bar(g, zx + 18 * u, zy + 20 * u, 18 * u, 4 * u, C.strong); bar(g, zx + 53 * u, zy + 17 * u, 18 * u, 10 * u, C.soft); bar(g, zx + 88 * u, zy + 20 * u, 18 * u, 4 * u, C.strong)
  }

  function list(g, R, u) {
    const { cx, cy, cw, ch } = R
    box(g, cx, cy, 340 * u, 44 * u, 14 * u, { fill: C.s2 })
    bar(g, cx + 24 * u, cy + 18 * u, 130 * u, 9 * u, C.soft)
    ;[88, 104, 76].forEach((pw, i) => { const px = cx + 360 * u + i * 114 * u; box(g, px, cy + 4 * u, pw * u, 36 * u, 18 * u, { stroke: C.lineStrong, lw: Math.max(1, u) }); bar(g, px + 18 * u, cy + 18 * u, (pw - 36) * u, 8 * u, C.soft) })
    box(g, cx + cw - 150 * u, cy, 150 * u, 44 * u, 14 * u, { fill: C.accent })
    bar(g, cx + cw - 118 * u, cy + 18 * u, 86 * u, 10 * u, 'rgba(255,255,255,.75)')
    const ry0 = cy + 76 * u, rh = 80 * u
    const n = Math.max(2, Math.floor((cy + ch - 60 * u - ry0) / rh))
    for (let i = 0; i < n; i++) {
      const ry = ry0 + i * rh
      if (i === 1) box(g, cx - 10 * u, ry + 4 * u, cw + 20 * u, rh - 8 * u, 14 * u, { fill: C.s2 })
      dot(g, cx + 26 * u, ry + rh / 2, 22 * u, i % 3 === 0 ? C.accentSoft : C.s3)
      bar(g, cx + 68 * u, ry + rh / 2 - 17 * u, (190 + ((i * 47) % 110)) * u, 14 * u, C.strong)
      bar(g, cx + 68 * u, ry + rh / 2 + 7 * u, (130 + ((i * 31) % 80)) * u, 10 * u, C.soft)
      bar(g, cx + cw * 0.55, ry + rh / 2 - 5 * u, (90 + ((i * 17) % 60)) * u, 10 * u, C.soft)
      box(g, cx + cw - 118 * u, ry + rh / 2 - 15 * u, 100 * u, 30 * u, 15 * u, { fill: i % 2 ? C.s2 : C.accentSoft })
      bar(g, cx + cw - 96 * u, ry + rh / 2 - 4 * u, 56 * u, 8 * u, i % 2 ? C.soft : 'rgba(45,120,194,.6)')
      g.fillStyle = C.line; g.fillRect(cx, ry + rh - 1, cw, Math.max(1, u))
    }
  }

  function form(g, R, u) {
    const { cx, cy, cw, ch } = R
    const fw = Math.min(cw * 0.6, 780 * u), fh = ch - 70 * u
    box(g, cx, cy, fw, fh, 18 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u), shadow: [24 * u, 8 * u, 'rgba(20,60,110,.08)'] })
    bar(g, cx + 32 * u, cy + 34 * u, 230 * u, 20 * u, C.strong)
    bar(g, cx + 32 * u, cy + 66 * u, 340 * u, 10 * u, C.soft)
    const rows = Math.max(2, Math.min(4, Math.floor((fh - 220 * u) / 96 * u / u)))
    for (let i = 0; i < rows; i++) {
      const fy = cy + 110 * u + i * 96 * u
      bar(g, cx + 32 * u, fy, 100 * u, 10 * u, C.soft)
      if (i === 1) { const half = (fw - 96 * u) / 2; box(g, cx + 32 * u, fy + 22 * u, half, 52 * u, 12 * u, { fill: '#fbfdff', stroke: C.lineStrong, lw: Math.max(1, u) }); box(g, cx + 64 * u + half, fy + 22 * u, half, 52 * u, 12 * u, { fill: '#fbfdff', stroke: C.lineStrong, lw: Math.max(1, u) }) }
      else { box(g, cx + 32 * u, fy + 22 * u, fw - 64 * u, 52 * u, 12 * u, { fill: '#fbfdff', stroke: i === 0 ? C.accent : C.lineStrong, lw: i === 0 ? 2 * u : Math.max(1, u) }); bar(g, cx + 52 * u, fy + 44 * u, (150 + i * 40) * u, 9 * u, C.soft) }
    }
    const by = cy + 110 * u + rows * 96 * u
    box(g, cx + 32 * u, by, 190 * u, 56 * u, 16 * u, { fill: C.accent })
    bar(g, cx + 32 * u + 52 * u, by + 24 * u, 86 * u, 10 * u, 'rgba(255,255,255,.8)')
    const sx = cx + fw + 30 * u, sw = cx + cw - sx
    if (sw > 200 * u) {
      box(g, sx, cy, sw, fh * 0.62, 18 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u) })
      bar(g, sx + 26 * u, cy + 30 * u, 120 * u, 14 * u, C.strong)
      for (let i = 0; i < 4; i++) { bar(g, sx + 26 * u, cy + 76 * u + i * 44 * u, 100 * u, 10 * u, C.soft); bar(g, sx + sw - 90 * u, cy + 76 * u + i * 44 * u, 64 * u, 10 * u, C.strong) }
    }
  }

  // ---------- phone ----------
  function drawPhone(g, W, H, e) {
    const u = W / 390
    g.fillStyle = vgrad(g, 0, H, C.bg, C.s2); g.fillRect(0, 0, W, H)
    bar(g, 24 * u, 17 * u, 38 * u, 10 * u, C.strong)
    ;[0, 1, 2].forEach((i) => bar(g, W - 88 * u + i * 22 * u, 17 * u, 16 * u, 10 * u, C.strong))
    bar(g, 24 * u, 66 * u, 170 * u, 24 * u, C.strong)
    bar(g, 24 * u, 100 * u, 120 * u, 11 * u, C.soft)
    dot(g, W - 46 * u, 84 * u, 22 * u, C.s3)
    box(g, 20 * u, 134 * u, W - 40 * u, 48 * u, 24 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u) })
    bar(g, 46 * u, 154 * u, 110 * u, 9 * u, C.soft)
    const hh = 168 * u
    box(g, 20 * u, 202 * u, W - 40 * u, hh, 24 * u, { fill: C.accent, shadow: [30 * u, 14 * u, 'rgba(45,120,194,.28)'] })
    bar(g, 44 * u, 230 * u, 120 * u, 11 * u, 'rgba(255,255,255,.6)')
    bar(g, 44 * u, 256 * u, 170 * u, 22 * u, 'rgba(255,255,255,.95)')
    box(g, 44 * u, 202 * u + hh - 54 * u, 108 * u, 34 * u, 17 * u, { fill: 'rgba(255,255,255,.2)' })
    dot(g, W - 76 * u, 270 * u, 40 * u, 'rgba(255,255,255,.14)')
    dot(g, W - 56 * u, 300 * u, 26 * u, 'rgba(255,255,255,.14)')
    const tab = 88 * u, y0 = 202 * u + hh + 26 * u, rh = 84 * u
    const n = Math.max(2, Math.floor((H - tab - y0 - 90 * u) / rh))
    for (let i = 0; i < n; i++) {
      const ry = y0 + i * rh
      box(g, 20 * u, ry, W - 40 * u, rh - 14 * u, 18 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u) })
      box(g, 36 * u, ry + 13 * u, 44 * u, 44 * u, 14 * u, { fill: i === 0 ? C.accentSoft : C.s3 })
      bar(g, 94 * u, ry + 20 * u, (130 + ((i * 23) % 60)) * u, 12 * u, C.strong)
      bar(g, 94 * u, ry + 42 * u, 90 * u, 9 * u, C.soft)
      bar(g, W - 82 * u, ry + 30 * u, 44 * u, 10 * u, C.soft)
    }
    g.fillStyle = '#fff'; g.fillRect(0, H - tab, W, tab)
    g.fillStyle = C.line; g.fillRect(0, H - tab, W, Math.max(1, u))
    for (let i = 0; i < 4; i++) {
      const tx = (W / 4) * (i + 0.5), ty = H - tab + 30 * u
      box(g, tx - 11 * u, ty - 11 * u, 22 * u, 22 * u, 7 * u, { fill: i === 0 ? C.accent : C.s3 })
      bar(g, tx - 14 * u, ty + 20 * u, 28 * u, 5 * u, i === 0 ? C.strong : C.soft)
    }
    bar(g, W / 2 - 62 * u, H - 14 * u, 124 * u, 5 * u, C.strong)
    caption(g, W / 2, H - tab - 40 * u, captionText(e, W, H), u * 0.85)
  }

  // ---------- popup ----------
  function drawPopup(g, W, H, e) {
    const u = W / 360
    box(g, 0, 0, W, H, 14 * u, { fill: C.surface })
    g.save(); rpath(g, 0, 0, W, H, 14 * u); g.clip()
    g.fillStyle = vgrad(g, 0, H, '#ffffff', '#f4f9ff'); g.fillRect(0, 0, W, H)
    box(g, 16 * u, 16 * u, 30 * u, 30 * u, 9 * u, { fill: C.accent })
    bar(g, 58 * u, 24 * u, 110 * u, 11 * u, C.strong); bar(g, 58 * u, 41 * u, 70 * u, 7 * u, C.soft)
    box(g, W - 62 * u, 22 * u, 44 * u, 24 * u, 12 * u, { fill: C.accent }); dot(g, W - 29 * u, 34 * u, 8 * u, '#fff')
    g.fillStyle = C.line; g.fillRect(0, 62 * u, W, Math.max(1, u))
    box(g, 16 * u, 76 * u, W - 32 * u, 36 * u, 12 * u, { fill: C.s2 }); bar(g, 32 * u, 91 * u, 90 * u, 7 * u, C.soft)
    const y0 = 128 * u, rh = 56 * u, n = Math.max(2, Math.min(4, Math.floor((H - y0 - 110 * u) / rh)))
    for (let i = 0; i < n; i++) {
      const ry = y0 + i * rh
      box(g, 16 * u, ry, W - 32 * u, rh - 8 * u, 14 * u, { fill: C.surface, stroke: C.line, lw: Math.max(1, u) })
      box(g, 28 * u, ry + 10 * u, 28 * u, 28 * u, 9 * u, { fill: i === 0 ? C.accentSoft : C.s3 })
      bar(g, 68 * u, ry + 15 * u, (100 + i * 14) * u, 9 * u, C.strong); bar(g, 68 * u, ry + 31 * u, 66 * u, 6 * u, C.soft)
      box(g, W - 62 * u, ry + 14 * u, 34 * u, 20 * u, 10 * u, { fill: i % 2 ? C.s3 : C.accent }); dot(g, i % 2 ? W - 52 * u : W - 38 * u, ry + 24 * u, 7 * u, '#fff')
    }
    const by = y0 + n * rh + 8 * u
    box(g, 16 * u, by, W - 32 * u, 42 * u, 14 * u, { fill: C.accent }); bar(g, W / 2 - 40 * u, by + 17 * u, 80 * u, 8 * u, 'rgba(255,255,255,.85)')
    caption(g, W / 2, H - 28 * u, captionText(e, W, H), u * 0.62)
    g.restore()
    rpath(g, 0.5, 0.5, W - 1, H - 1, 14 * u); g.strokeStyle = C.lineStrong; g.lineWidth = 1; g.stroke()
  }

  // ---------- illustration (transparent): a desk with a laptop, lamp, mug, plant, books ----------
  function drawIllustration(g, W, H, e) {
    const u = W / 1200
    const deskY = H * 0.66, deskX = W * 0.06, deskW = W * 0.88
    const shadowEl = (cx, cy, rx, ry, a) => { g.save(); g.translate(cx, cy); g.scale(1, ry / rx); g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fillStyle = `rgba(14,27,42,${a})`; g.filter = `blur(${10 * u}px)`; g.fill(); g.restore() }
    // legs and desk
    box(g, deskX + deskW * 0.07, deskY + 30 * u, 26 * u, H * 0.26, 8 * u, { fill: '#a9c4df' })
    box(g, deskX + deskW * 0.92 - 26 * u, deskY + 30 * u, 26 * u, H * 0.26, 8 * u, { fill: '#a9c4df' })
    box(g, deskX, deskY, deskW, 34 * u, 14 * u, { fill: '#c4d8ec' })
    box(g, deskX + 10 * u, deskY + 34 * u, deskW - 20 * u, 40 * u, 10 * u, { fill: '#b4cde6' })
    box(g, deskX + deskW * 0.5 - 90 * u, deskY + 46 * u, 180 * u, 12 * u, 6 * u, { fill: '#a0bddb' })
    // laptop
    const lx = W * 0.3, lw = W * 0.34, lh = lw * 0.62, ly = deskY - lh - 12 * u
    shadowEl(lx + lw / 2, deskY + 6 * u, lw * 0.62, 20 * u, 0.16)
    box(g, lx, ly, lw, lh, 18 * u, { fill: '#44566b' })
    box(g, lx + 14 * u, ly + 14 * u, lw - 28 * u, lh - 28 * u, 10 * u, { fill: C.bg })
    const sx = lx + 14 * u, sy = ly + 14 * u, sw = lw - 28 * u
    box(g, sx, sy, sw, 26 * u, 10 * u, { fill: C.s3 })
    box(g, sx + 20 * u, sy + 52 * u, sw * 0.4, 18 * u, 9 * u, { fill: C.accent })
    bar(g, sx + 20 * u, sy + 86 * u, sw * 0.58, 11 * u, C.soft); bar(g, sx + 20 * u, sy + 108 * u, sw * 0.46, 11 * u, C.soft)
    box(g, sx + sw * 0.66, sy + 52 * u, sw * 0.28, lh * 0.34, 12 * u, { fill: C.accentSoft })
    box(g, lx - 30 * u, deskY - 14 * u, lw + 60 * u, 16 * u, 8 * u, { fill: '#566779' })
    box(g, lx + lw / 2 - 40 * u, deskY - 12 * u, 80 * u, 6 * u, 3 * u, { fill: '#44566b' })
    // lamp (left)
    const px = W * 0.17, baseY = deskY
    shadowEl(px, baseY + 4 * u, 70 * u, 12 * u, 0.15)
    box(g, px - 56 * u, baseY - 14 * u, 112 * u, 18 * u, 9 * u, { fill: '#44566b' })
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#566779'; g.lineWidth = 9 * u
    g.beginPath(); g.moveTo(px, baseY - 12 * u); g.lineTo(px + 30 * u, baseY - H * 0.27); g.lineTo(px + 130 * u, baseY - H * 0.36); g.stroke()
    const hx = px + 130 * u, hy = baseY - H * 0.36
    g.save(); g.translate(hx, hy); g.rotate(0.45)
    g.beginPath(); g.moveTo(-28 * u, -4 * u); g.lineTo(28 * u, -4 * u); g.lineTo(54 * u, 62 * u); g.lineTo(-54 * u, 62 * u); g.closePath()
    g.fillStyle = C.accent; g.fill()
    const cone = g.createLinearGradient(0, 62 * u, 0, 62 * u + H * 0.34)
    cone.addColorStop(0, 'rgba(45,120,194,.16)'); cone.addColorStop(1, 'rgba(45,120,194,0)')
    g.beginPath(); g.moveTo(-54 * u, 62 * u); g.lineTo(54 * u, 62 * u); g.lineTo(180 * u, 62 * u + H * 0.34); g.lineTo(-180 * u, 62 * u + H * 0.34); g.closePath()
    g.fillStyle = cone; g.fill()
    g.restore()
    // mug
    const mx = W * 0.665, mw = 70 * u, mh = 76 * u
    shadowEl(mx + mw / 2, deskY + 4 * u, 52 * u, 8 * u, 0.15)
    box(g, mx, deskY - mh, mw, mh, 14 * u, { fill: C.surface, stroke: C.lineStrong, lw: 2 * u })
    g.beginPath(); g.arc(mx + mw + 4 * u, deskY - mh / 2, 18 * u, -Math.PI / 2, Math.PI / 2); g.strokeStyle = C.lineStrong; g.lineWidth = 8 * u; g.stroke()
    box(g, mx + 8 * u, deskY - mh + 12 * u, mw - 16 * u, 10 * u, 5 * u, { fill: C.accentSoft })
    // books
    const bx = W * 0.76, books = [[130, 26, '#2d78c2'], [112, 22, '#9db9d6'], [122, 24, '#d9e7f5']]
    let by = deskY
    shadowEl(bx + 70 * u, deskY + 4 * u, 100 * u, 9 * u, 0.14)
    books.forEach(([bw, bh, c], i) => { by -= bh * u; box(g, bx + (i % 2 ? 10 : 0) * u, by, bw * u, bh * u, 6 * u, { fill: c }) })
    // plant
    const ppx = W * 0.9
    box(g, ppx - 36 * u, deskY - 70 * u, 72 * u, 70 * u, 12 * u, { fill: '#d9e7f5', stroke: C.lineStrong, lw: 2 * u })
    g.fillStyle = '#5f8f78'
    ;[[-34, -150, -0.5], [0, -190, 0], [34, -150, 0.5], [-14, -120, -0.2], [16, -118, 0.25]].forEach(([dx, dy, rot]) => {
      g.save(); g.translate(ppx + dx * u, deskY + dy * u + 80 * u); g.rotate(rot)
      g.beginPath(); g.ellipse(0, 0, 18 * u, 52 * u, 0, 0, TAU); g.fill(); g.restore()
    })
    caption(g, W / 2, H - 28 * u, captionText(e, W, H), u * 0.9, 'grey')
  }

  // ---------- poster / video layers ----------
  function posterBase(g, W, H) {
    g.fillStyle = C.onyx; g.fillRect(0, 0, W, H)
    const gr = g.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.46, W * 0.7)
    gr.addColorStop(0, '#1e1e1e'); gr.addColorStop(1, '#0a0a0a')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
  }
  function blob(g, cx, cy, r, rgba) {
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r)
    gr.addColorStop(0, rgba); gr.addColorStop(1, 'rgba(45,120,194,0)')
    g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  function posterFront(g, W, H, e) {
    let fh = Math.min(H * 0.66, (W * 0.62) / 1.6), fw = fh * 1.6
    const fx = (W - fw) / 2, fy = H * 0.47 - fh / 2
    const [sv, sg] = mk(1600, 1000)
    drawScreen(sg, 1600, 1000, { variant: 'dashboard' }, { noCaption: true })
    g.save()
    g.shadowBlur = fh * 0.12; g.shadowOffsetY = fh * 0.05; g.shadowColor = 'rgba(0,0,0,.55)'
    rpath(g, fx, fy, fw, fh, fh * 0.022); g.fillStyle = '#0a0a0a'; g.fill()
    g.restore()
    g.save(); rpath(g, fx, fy, fw, fh, fh * 0.022); g.clip(); g.drawImage(sv, fx, fy, fw, fh); g.restore()
    rpath(g, fx, fy, fw, fh, fh * 0.022); g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = Math.max(1, W / 1280); g.stroke()
    caption(g, W / 2, Math.min(H - 28 * (W / 1280), fy + fh + H * 0.07), captionText(e, W, H), (W / 1280) * 0.85, 'dark')
  }
  function drawPoster(g, W, H, e) {
    posterBase(g, W, H)
    blob(g, W * 0.3, H * 0.35, H * 0.55, 'rgba(45,120,194,.22)')
    blob(g, W * 0.72, H * 0.68, H * 0.5, 'rgba(45,120,194,.14)')
    posterFront(g, W, H, e)
  }

  // ---------- logo / mark / badge / avatar ----------
  function drawLogo(g, W, H, e) {
    const col = HUES[hash(e.path) % HUES.length], u = W / 200
    box(g, 0, 0, W, H, 44 * u, { fill: col })
    g.save(); rpath(g, 0, 0, W, H, 44 * u); g.clip()
    g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.arc(W * 0.9, H * 0.05, W * 0.5, 0, TAU); g.fill()
    g.restore()
    const cx = W / 2, cy = H * 0.4, s = 38 * u, kind = hash(e.path + 'g') % 5
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'
    if (kind === 0) { g.beginPath(); g.arc(cx, cy, s, 0, TAU); g.fill(); g.beginPath(); g.arc(cx + s * 0.38, cy, s * 0.6, 0, TAU); g.fillStyle = col; g.fill() }
    else if (kind === 1) { g.beginPath(); g.moveTo(cx, cy - s); g.lineTo(cx + s, cy + s * 0.8); g.lineTo(cx - s, cy + s * 0.8); g.closePath(); g.fill(); g.beginPath(); g.moveTo(cx, cy + s * 0.05); g.lineTo(cx + s * 0.38, cy + s * 0.8); g.lineTo(cx - s * 0.38, cy + s * 0.8); g.closePath(); g.fillStyle = col; g.fill() }
    else if (kind === 2) { for (let i = 0; i < 3; i++) box(g, cx - s + i * s * 0.72, cy - s * 0.2 - i * s * 0.4, s * 0.5, s * (1.2 + i * 0.4) , s * 0.14, { fill: '#fff' }) }
    else if (kind === 3) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = (TAU / 6) * i - Math.PI / 2; g.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s) } g.closePath(); g.lineWidth = s * 0.3; g.lineJoin = 'round'; g.stroke(); dot(g, cx, cy, s * 0.22, '#fff') }
    else { g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4); box(g, -s * 0.8, -s * 0.8, s * 1.6, s * 1.6, s * 0.3, { fill: '#fff' }); box(g, -s * 0.36, -s * 0.36, s * 0.72, s * 0.72, s * 0.12, { fill: col }); g.restore() }
    g.fillStyle = '#fff'; g.font = `700 ${Math.round(30 * u)}px ${GEIST}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'
    g.fillText('Client', W / 2, H * 0.84)
  }

  function drawMark(g, W, H, e) {
    const dark = e.theme === 'dark', ink = dark ? C.bg : C.ink, letter = dark ? C.ink : C.bg
    if (e.opaque) { g.fillStyle = ink; g.fillRect(0, 0, W, H) } else box(g, 0, 0, W, H, W * 0.24, { fill: ink })
    g.fillStyle = letter; g.font = `700 ${Math.round(W * 0.56)}px ${GEIST}`; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText((e.label || 'Y').slice(0, 2), W / 2, H * 0.47)
    box(g, W * 0.39, H * 0.77, W * 0.22, W * 0.04, W * 0.02, { fill: dark ? '#5b9bd5' : C.accent })
  }

  function drawBadge(g, W, H, e) {
    const cx = W / 2, cy = H * 0.43, R = W * 0.4
    ;[-1, 1].forEach((s) => { g.beginPath(); g.moveTo(cx + s * W * 0.07, cy + R * 0.7); g.lineTo(cx + s * W * 0.26, H * 0.97); g.lineTo(cx + s * W * 0.15, H * 0.9); g.lineTo(cx + s * W * 0.02, H * 0.97); g.closePath(); g.fillStyle = C.accentDeep; g.fill() })
    g.beginPath()
    for (let i = 0; i <= 360; i++) { const a = (i / 360) * TAU, r = R * (1 + 0.045 * Math.cos(18 * a)); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) }
    g.closePath(); g.fillStyle = C.accent; g.shadowColor = 'rgba(20,60,110,.3)'; g.shadowBlur = W * 0.05; g.shadowOffsetY = W * 0.02; g.fill(); g.shadowColor = 'transparent'
    g.beginPath(); g.arc(cx, cy, R * 0.8, 0, TAU); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = W * 0.012; g.stroke()
    g.beginPath(); g.arc(cx, cy, R * 0.7, 0, TAU); g.fillStyle = C.accentInk; g.fill()
    ;[-1, 0, 1].forEach((k) => dot(g, cx + k * W * 0.045, cy - R * 0.38, W * 0.01, 'rgba(255,255,255,.85)'))
    const label = e.label || 'Certified'
    let fs = W * 0.15; g.font = `600 ${fs}px ${GEIST}`
    while (g.measureText(label).width > R * 1.2 && fs > 6) { fs -= 1; g.font = `600 ${fs}px ${GEIST}` }
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, cx, cy + R * 0.08)
    bar(g, cx - R * 0.26, cy + R * 0.36, R * 0.52, W * 0.012, 'rgba(255,255,255,.5)')
  }

  function drawAvatar(g, W, H) {
    g.fillStyle = '#cfe1f3'; g.fillRect(0, 0, W, H)
    const gr = g.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, W * 0.7); gr.addColorStop(0, '#e1eefa'); gr.addColorStop(1, '#cfe1f3')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
    g.fillStyle = '#7ba8d6'
    dot(g, W / 2, H * 0.4, W * 0.17, '#7ba8d6')
    g.beginPath(); g.moveTo(W * 0.14, H); g.bezierCurveTo(W * 0.14, H * 0.68, W * 0.32, H * 0.63, W / 2, H * 0.63); g.bezierCurveTo(W * 0.68, H * 0.63, W * 0.86, H * 0.68, W * 0.86, H); g.closePath(); g.fill()
  }

  // ---------- dispatch ----------
  const extOf = (p) => p.split('.').pop().toLowerCase()
  const toURL = (cv, ext, bg) => {
    if (ext === 'png') return cv.toDataURL('image/png')
    if (ext === 'jpg' || ext === 'jpeg') {
      const [c2, g2] = mk(cv.width, cv.height); g2.fillStyle = bg || C.bg; g2.fillRect(0, 0, cv.width, cv.height); g2.drawImage(cv, 0, 0)
      return c2.toDataURL('image/jpeg', 0.9)
    }
    return cv.toDataURL('image/webp', 0.86)
  }
  const DRAW = { screen: drawScreen, phone: drawPhone, popup: drawPopup, illustration: drawIllustration, poster: drawPoster, logo: drawLogo, mark: drawMark, badge: drawBadge, avatar: drawAvatar }

  window.__render = async (e) => {
    await document.fonts.ready
    const [cv, g] = mk(e.width, e.height)
    if (e.layer) {
      if (e.layer === 'base') posterBase(g, e.width, e.height)
      else if (e.layer === 'blob') blob(g, e.width / 2, e.height / 2, Math.min(e.width, e.height) / 2, 'rgba(45,120,194,.30)')
      else if (e.layer === 'front') posterFront(g, e.width, e.height, e)
      return cv.toDataURL('image/png')
    }
    const fn = DRAW[e.kind]
    if (!fn) throw new Error(`no drawer for kind ${e.kind}`)
    fn(g, e.width, e.height, e)
    return toURL(cv, extOf(e.path))
  }

  window.__fromImage = async (src, w, h, ext) => {
    const img = new Image()
    img.src = src
    await img.decode()
    const [cv, g] = mk(w, h)
    g.drawImage(img, 0, 0, w, h)
    return toURL(cv, ext)
  }
})()

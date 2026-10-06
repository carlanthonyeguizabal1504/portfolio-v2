// Self-contained placeholder demo pages (variants: site, funnel, booking, plan).
// Inline CSS only, system font stack, no scripts, no external requests: they stay inside the demos CSP
// (default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:).

// Muted accent hues, one per page index, so a set of pages does not read as one page repeated.
const PALETTES = [
  { bg: '#f0f8ff', surface: '#ffffff', alt: '#e6f0fa', ink: '#0e1b2a', muted: '#566779', accent: '#2d78c2', on: '#ffffff' },
  { bg: '#f3f7f3', surface: '#ffffff', alt: '#e5eee7', ink: '#14231b', muted: '#5a6d62', accent: '#47795f', on: '#ffffff' },
  { bg: '#fbf5f0', surface: '#ffffff', alt: '#f3e8de', ink: '#2a1a12', muted: '#7a6558', accent: '#a85a3a', on: '#ffffff' },
  { bg: '#f0f7f7', surface: '#ffffff', alt: '#e0eeee', ink: '#10272b', muted: '#55696c', accent: '#34767f', on: '#ffffff' },
  { bg: '#0a0a0a', surface: '#141414', alt: '#1e1e1e', ink: '#f2f6fa', muted: '#93a1b0', accent: '#5b9bd5', on: '#0a0a0a' },
  { bg: '#faf6ec', surface: '#ffffff', alt: '#f1ead6', ink: '#231d0c', muted: '#6f664d', accent: '#85661c', on: '#ffffff' },
  { bg: '#f2f4f7', surface: '#ffffff', alt: '#e4e8ee', ink: '#151a22', muted: '#5b6573', accent: '#4f6587', on: '#ffffff' },
]

const css = (p) => `
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:${p.bg};color:${p.ink};line-height:1.55}
a{color:inherit;text-decoration:none}
.wrap{max-width:1160px;margin:0 auto;padding:0 40px}
nav{display:flex;align-items:center;justify-content:space-between;height:84px}
.logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:18px;letter-spacing:-.01em}
.logo i{width:30px;height:30px;border-radius:9px;background:${p.accent};display:block}
.links{display:flex;gap:34px;font-size:15px;color:${p.muted}}
.btn{display:inline-flex;align-items:center;justify-content:center;background:${p.accent};color:${p.on};font-weight:600;font-size:15px;padding:14px 26px;border-radius:14px}
.btn.ghost{background:transparent;color:${p.ink};box-shadow:inset 0 0 0 1.5px ${p.muted}55}
.eyebrow{display:inline-block;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${p.accent};margin-bottom:20px}
h1{font-size:clamp(38px,5.2vw,64px);line-height:1.04;letter-spacing:-.035em;font-weight:700;max-width:14ch}
h2{font-size:clamp(26px,3vw,38px);line-height:1.12;letter-spacing:-.025em;font-weight:700;margin-bottom:12px}
h3{font-size:19px;letter-spacing:-.01em;margin-bottom:8px}
.lede{font-size:18px;color:${p.muted};max-width:46ch;margin:22px 0 34px}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.card{background:${p.surface};border-radius:22px;padding:30px;box-shadow:0 0 0 1px ${p.muted}22,0 18px 40px -26px #00000040}
.card p{color:${p.muted};font-size:15px}
.ph{border-radius:26px;background:${p.alt};position:relative;overflow:hidden;min-height:340px}
.ph::before{content:"";position:absolute;inset:9% 8% auto 8%;height:16px;border-radius:8px;background:${p.muted}33;box-shadow:0 34px 0 -2px ${p.muted}22,0 68px 0 -2px ${p.muted}22}
.ph::after{content:"";position:absolute;left:8%;right:8%;bottom:9%;height:44%;border-radius:18px;background:${p.surface};box-shadow:0 0 0 1px ${p.muted}22}
.ph span{position:absolute;z-index:1;left:50%;bottom:calc(9% + 22%);transform:translate(-50%,50%);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:${p.muted};background:${p.bg};padding:6px 12px;border-radius:99px;box-shadow:0 0 0 1px ${p.muted}33;white-space:nowrap}
.ico{width:46px;height:46px;border-radius:14px;background:${p.accent}1f;display:grid;place-items:center;margin-bottom:22px}
.ico b{width:20px;height:20px;border-radius:6px;background:${p.accent};display:block}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.field{height:50px;border-radius:13px;background:${p.bg};box-shadow:inset 0 0 0 1.5px ${p.muted}44;padding:0 16px;display:flex;align-items:center;color:${p.muted};font-size:14px}
.field.on{box-shadow:inset 0 0 0 2px ${p.accent}}
.lab{font-size:12px;font-weight:600;color:${p.muted};margin:0 0 7px}
.stack{display:grid;gap:14px}
footer{border-top:1px solid ${p.muted}33;padding:32px 0 44px;color:${p.muted};font-size:14px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
@media(max-width:820px){.wrap{padding:0 22px}.links{display:none}.grid3,.two{grid-template-columns:1fr!important}}
`

const shell = (p, title, body, extra = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>${css(p)}${extra}</style></head>
<body>${body}</body></html>
`

const nav = (cta = 'Get a quote') => `<nav><a class="logo" href="#"><i></i>Business Name</a>
<div class="links"><a href="#">Services</a><a href="#">About</a><a href="#">Reviews</a><a href="#">Contact</a></div>
<a class="btn" href="#">${cta}</a></nav>`

const foot = () => `<footer><span>&copy; 2026 Business Name</span><span>Privacy &middot; Terms &middot; Contact</span></footer>`
const lines = (n, w = 100) => Array.from({ length: n }, (_, i) => `<div style="height:9px;border-radius:5px;background:currentColor;opacity:.13;margin-top:10px;width:${i === n - 1 ? w * 0.6 : w}%"></div>`).join('')

function site(p, t) {
  const services = ['Service One', 'Service Two', 'Service Three']
  return shell(p, t, `<div class="wrap">${nav()}
<section class="two" style="display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center;padding:56px 0 96px">
<div><span class="eyebrow">Your tagline here</span><h1>Your headline here.</h1>
<p class="lede">A short sentence on who you help and what you do for them. Replace this with your own line.</p>
<div class="actions"><a class="btn" href="#">Primary action</a><a class="btn ghost" href="#">Secondary</a></div></div>
<div class="ph"><span>Your hero image</span></div></section>
<section style="padding:0 0 96px"><h2>What we do</h2><p style="color:${p.muted};margin-bottom:34px;max-width:52ch">One line introducing the services below.</p>
<div class="grid3">${services.map((s) => `<div class="card"><div class="ico"><b></b></div><h3>${s}</h3><p>A short description of this service and the result it gives your customer.</p></div>`).join('')}</div></section>
<section class="card" style="display:grid;grid-template-columns:1fr auto;gap:36px;align-items:center;padding:52px;margin-bottom:96px">
<div><p style="font-size:24px;line-height:1.35;color:${p.ink};max-width:36ch">&ldquo;A short testimonial from a happy customer goes here.&rdquo;</p><p style="margin-top:18px;font-size:14px">Customer Name, Company</p></div>
<a class="btn" href="#">Book a call</a></section>
${foot()}</div>`)
}

function funnel(p, t, idx) {
  const bullets = ['First thing they get', 'Second thing they get', 'Third thing they get']
  const check = `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill="${p.accent}" opacity=".18"/><path d="M6.5 11.4l3 3 6-6.4" fill="none" stroke="${p.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const form = `<div class="card stack" style="padding:34px"><h3 style="font-size:22px;margin:0">Get the free guide</h3><p>Enter your details and we will send it over.</p>
<div><div class="lab">Name</div><div class="field on">Your name</div></div><div><div class="lab">Email</div><div class="field">you@example.com</div></div>
<a class="btn" href="#" style="height:54px;font-size:16px">Send it to me</a><p style="font-size:12px;text-align:center">No spam. Unsubscribe any time.</p></div>`
  const stats = `<div style="display:flex;gap:44px;margin-top:44px;flex-wrap:wrap">${['1,000+', '4.9', '24h'].map((n, i) => `<div><b style="font-size:26px;letter-spacing:-.02em">${n}</b><div style="font-size:13px;color:${p.muted}">${['Happy customers', 'Average rating', 'Reply time'][i]}</div></div>`).join('')}</div>`
  if (idx % 2) {
    return shell(p, t, `<div class="wrap" style="max-width:760px;text-align:center"><nav style="justify-content:center"><a class="logo" href="#"><i></i>Business Name</a></nav>
<section style="padding:44px 0 84px"><span class="eyebrow">Free resource</span><h1 style="max-width:none;margin:0 auto">Your headline here.</h1>
<p class="lede" style="margin:22px auto 38px">A one-line promise of the outcome, written for your reader.</p><div style="text-align:left">${form}</div>${stats.replace('margin-top:44px', 'margin-top:44px;justify-content:center')}</section>${foot()}</div>`)
  }
  return shell(p, t, `<div class="wrap">${nav('Sign in')}
<section class="two" style="display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center;padding:48px 0 96px">
<div><span class="eyebrow">Free resource</span><h1>Your headline here.</h1><p class="lede">A one-line promise of the outcome, written for your reader.</p>
<div class="stack" style="gap:16px">${bullets.map((b) => `<div style="display:flex;gap:14px;align-items:center;font-size:17px">${check}${b}</div>`).join('')}</div>${stats}</div>${form}</section>${foot()}</div>`)
}

function booking(p, t) {
  const days = Array.from({ length: 35 }, (_, i) => i - 3)
  const cal = days.map((d) => {
    if (d < 1 || d > 31) return '<span></span>'
    const on = d === 14, free = !on && d % 7 > 0 && d % 7 < 6
    return `<span style="height:44px;border-radius:13px;display:grid;place-items:center;font-size:15px;font-weight:${on ? 700 : 500};background:${on ? p.accent : free ? p.accent + '14' : 'transparent'};color:${on ? p.on : free ? p.ink : p.muted + '88'}">${d}</span>`
  }).join('')
  const slots = ['9:00 am', '9:30 am', '10:30 am', '11:00 am', '1:00 pm', '2:30 pm', '3:00 pm', '4:30 pm']
  return shell(p, t, `<div class="wrap" style="max-width:1080px">${nav('Contact')}
<section class="card" style="display:grid;grid-template-columns:260px 1fr 190px;gap:0;padding:0;margin:20px 0 40px;overflow:hidden" id="b">
<div style="padding:34px;border-right:1px solid ${p.muted}22"><div style="width:52px;height:52px;border-radius:50%;background:${p.alt}"></div>
<p style="margin-top:20px;font-size:13px">Business Name</p><h2 style="font-size:26px;margin:4px 0 14px">Service Name</h2>
<div style="font-size:14px;color:${p.muted};display:grid;gap:8px"><span>30 min</span><span>Video or phone call</span></div><div style="color:${p.muted};margin-top:18px">${lines(4)}</div></div>
<div style="padding:34px;border-right:1px solid ${p.muted}22"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px"><h3 style="margin:0">January 2026</h3><span style="color:${p.muted};letter-spacing:.3em">&lsaquo; &rsaquo;</span></div>
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:12px;color:${p.muted};margin-bottom:8px">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<span>${d}</span>`).join('')}</div>
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center">${cal}</div></div>
<div style="padding:34px 24px"><p style="font-size:14px;font-weight:600;margin-bottom:16px">Wed 14</p><div class="stack" style="gap:10px">${slots.map((s, i) => `<span style="height:44px;border-radius:12px;display:grid;place-items:center;font-size:14px;font-weight:600;color:${p.accent};box-shadow:inset 0 0 0 1.5px ${i === 2 ? p.accent : p.accent + '55'};background:${i === 2 ? p.accent + '14' : 'transparent'}">${s}</span>`).join('')}</div></div></section>
<section class="card stack" style="max-width:520px;margin:0 auto 80px"><h3>Your details</h3><div><div class="lab">Name</div><div class="field">Your name</div></div><div><div class="lab">Email</div><div class="field">you@example.com</div></div>
<a class="btn" href="#">Confirm booking</a></section>${foot()}</div>`, '@media(max-width:820px){#b{grid-template-columns:1fr!important}}')
}

function plan(p, t) {
  const rows = [['Capture the lead', 'Form submitted', 'System', 'Done'], ['Tag and route', 'New contact', 'System', 'Done'], ['Send the welcome message', 'Tag added', 'Owner Name', 'In progress'], ['Wait for a reply', 'Two days', 'System', 'In progress'], ['Create the follow-up task', 'No reply', 'Team Member', 'Planned'], ['Close the loop', 'Task complete', 'Owner Name', 'Planned']]
  const pill = (s) => `<span style="display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:600;background:${s === 'Done' ? p.accent + '22' : s === 'In progress' ? p.alt : 'transparent'};color:${s === 'Done' ? p.accent : p.muted};box-shadow:inset 0 0 0 1px ${p.muted}33">${s}</span>`
  return shell(p, t, `<div class="wrap" style="max-width:940px"><nav><a class="logo" href="#"><i></i>Business Name</a><span style="color:${p.muted};font-size:14px">Plan v1.0</span></nav>
<header style="padding:36px 0 40px"><span class="eyebrow">Automation plan</span><h1 style="max-width:none;font-size:clamp(34px,4.2vw,52px)">Your plan title here.</h1>
<div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">${['Status: Draft', 'Owner: Owner Name', 'Date: 2026-01-01'].map((c) => `<span style="font-size:13px;padding:7px 14px;border-radius:99px;background:${p.alt};color:${p.muted}">${c}</span>`).join('')}</div></header>
<section class="card" style="margin-bottom:28px"><h2 style="font-size:24px">Overview</h2><div style="color:${p.muted}">${lines(4)}</div></section>
<section class="card" style="margin-bottom:28px;padding:10px 30px 18px"><h2 style="font-size:24px;padding-top:22px">Steps</h2>
<table style="width:100%;border-collapse:collapse;font-size:15px"><thead><tr style="text-align:left;color:${p.muted};font-size:12px;letter-spacing:.08em;text-transform:uppercase">${['#', 'Step', 'Trigger', 'Owner', 'Status'].map((h) => `<th style="padding:12px 10px;font-weight:600">${h}</th>`).join('')}</tr></thead><tbody>
${rows.map((r, i) => `<tr style="border-top:1px solid ${p.muted}26"><td style="padding:16px 10px;color:${p.muted}">${i + 1}</td><td style="padding:16px 10px;font-weight:600">${r[0]}</td><td style="padding:16px 10px;color:${p.muted}">${r[1]}</td><td style="padding:16px 10px;color:${p.muted}">${r[2]}</td><td style="padding:16px 10px">${pill(r[3])}</td></tr>`).join('')}</tbody></table></section>
<section class="card" style="margin-bottom:80px"><h2 style="font-size:24px">Notes</h2><div style="color:${p.muted}">${lines(3)}</div></section>${foot()}</div>`)
}

const VARIANTS = { site, funnel, booking, plan }
export const PAGE_VARIANTS = Object.keys(VARIANTS)
export const renderPage = (entry, idx) => VARIANTS[entry.variant](PALETTES[idx % PALETTES.length], entry.label || 'Sample Page', idx)

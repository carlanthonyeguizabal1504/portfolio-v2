import { contentRegistry, replace } from '@/content/personalize'

const URL = 'https://yoqrjrqhnghdentkqhxs.supabase.co'
const KEY = 'sb_publishable__PJ-SXvQ8Jz2SUF3rqdRTA_hd-DREP-'
const SESSION = 'carl-template-admin-session'
export type AdminSession = { access_token: string; refresh_token: string; expires_at: number; user: { id: string } }
export type ContentSnapshot = Record<string, unknown>
const headers = (token = KEY) => ({ apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

export async function request(path: string, options: RequestInit = {}, token = KEY) {
  const response = await fetch(URL + path, { ...options, headers: { ...headers(token), ...options.headers }, signal: AbortSignal.timeout(12000) })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error_description || data?.message || data?.msg || `Request failed (${response.status}).`)
  return data
}

export function snapshot(): ContentSnapshot { return JSON.parse(JSON.stringify(contentRegistry)) }

/** Reject unsafe URLs, prototype keys, invalid numbers, and corrupted top-level structures. */
export function validateContent(value: unknown): asserts value is ContentSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Choose a portfolio backup file.')
  function check(node: unknown, key = '') {
    if (typeof node === 'number' && !Number.isFinite(node)) throw new Error('Numbers must be finite.')
    if (typeof node === 'string' && /^(src|href|logo|avatarSmall|phone|wide|poster|url)$/i.test(key)) {
      if (node && !/^(https?:\/\/|\/(?!\/)|#|mailto:|tel:|data:image\/(png|jpeg|webp|gif);base64,)/i.test(node)) throw new Error(`Use an https URL or an uploaded image for ${key}.`)
    }
    if (Array.isArray(node)) node.forEach(n => check(n, key))
    else if (node && typeof node === 'object') Object.entries(node).forEach(([k,v]) => {
      if (['__proto__','constructor','prototype'].includes(k)) throw new Error('Invalid content key.')
      check(v,k)
    })
  }
  const candidate = value as ContentSnapshot
  for (const [key, base] of Object.entries(contentRegistry)) {
    if (!(key in candidate)) throw new Error(`The backup is missing ${key}.`)
    if (Array.isArray(base) !== Array.isArray(candidate[key]) || typeof base !== typeof candidate[key] || candidate[key] === null) throw new Error(`Check the ${key} section.`)
  }
  const d = candidate as Record<string, any>
  check(d.homeHero.cta.to, 'href')
  if (!Array.isArray(d.homeManifesto.parts) || d.homeManifesto.parts.filter((p: any) => p && typeof p === 'object' && 'key' in p).length !== 4) throw new Error('The manifesto needs exactly four highlighted words.')
  if (!Array.isArray(d.workChapters) || !d.workChapters.length || !Array.isArray(d.productTabs) || !d.productTabs.length) throw new Error('Keep at least one project chapter and one showcase tab.')
  for (const c of d.workChapters) if (!c.id || !Array.isArray(c.items)) throw new Error('Each project chapter needs its ID and items list.')
  for (const s of d.services) if (!Array.isArray(s.bullets) || s.bullets.length !== 3) throw new Error('Each skill card needs three bullets.')
  for (const q of d.communityQuotes) if (!/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(q.date)) throw new Error('Quote dates use Oct 6, 2026 format.')
  check(value)
}

function basePaths(node: unknown): unknown {
  if (typeof node === 'string') return node.replace(/(^|,\s*)(\/(?:images|fonts|media)\/|\/profile\.jpg|\/ca-navbar-logo\.png)/g, (_, comma: string, path: string) => comma + import.meta.env.BASE_URL + path.slice(1))
  if (Array.isArray(node)) return node.map(basePaths)
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k,v]) => [k, basePaths(v)]))
  return node
}

export function applyContent(data: ContentSnapshot) {
  validateContent(data)
  for (const key of Object.keys(contentRegistry)) replace(contentRegistry[key], basePaths(data[key]))
}

export async function loadContent() {
  try {
    const rows = await request('/rest/v1/portfolio_v2_content?id=eq.1&select=payload')
    if (rows[0]?.payload?.templateContent) { applyContent(rows[0].payload.templateContent); return true }
  } catch { /* The bundled public content remains available when offline. */ }
  return false
}

export function readSession(): AdminSession | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION) || 'null') } catch { return null }
}
export function storeSession(session: AdminSession | null) {
  if (session) sessionStorage.setItem(SESSION, JSON.stringify(session))
  else sessionStorage.removeItem(SESSION)
}
export async function verifyAdmin(session: AdminSession) {
  if (Date.now() > session.expires_at * 1000 - 60000) {
    session = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: session.refresh_token }) })
  }
  const user = await request('/auth/v1/user', {}, session.access_token)
  const admins = await request(`/rest/v1/portfolio_v2_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, {}, session.access_token)
  if (!Array.isArray(admins) || !admins.some((a: { user_id: string }) => a.user_id === user.id)) throw new Error('This account is not on the portfolio admin list.')
  storeSession(session)
  return session
}
export async function signIn(email: string, password: string) {
  const result = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) })
  return verifyAdmin(result)
}
export async function signOut() {
  const session = readSession()
  storeSession(null)
  if (session) await request('/auth/v1/logout', { method: 'POST' }, session.access_token).catch(() => {})
}

export async function saveContent(data: ContentSnapshot, session: AdminSession, expected: string) {
  validateContent(data)
  const active = await verifyAdmin(session)
  const rows = await request('/rest/v1/portfolio_v2_content?id=eq.1&select=payload', {}, active.access_token)
  const old = rows[0]?.payload || {}
  if ((old.templateRevision || '') !== expected) throw new Error('This portfolio was edited in another tab. Export your draft, then reload before saving.')
  const revision = new Date().toISOString()
  const body = { id: 1, payload: { ...old, templateContent: data, templateRevision: revision } }
  const condition = expected ? `&payload->>templateRevision=eq.${encodeURIComponent(expected)}` : '&payload->>templateRevision=is.null'
  const saved = await request(rows.length ? '/rest/v1/portfolio_v2_content?id=eq.1' + condition : '/rest/v1/portfolio_v2_content', { method: rows.length ? 'PATCH' : 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(rows.length ? { payload: body.payload } : body) }, active.access_token)
  if (!Array.isArray(saved) || !saved.length) throw new Error('Content changed in another tab. Reload before saving.')
  applyContent(data)
  return revision
}
export async function currentRevision() {
  const rows = await request('/rest/v1/portfolio_v2_content?id=eq.1&select=payload')
  return rows[0]?.payload?.templateRevision || ''
}

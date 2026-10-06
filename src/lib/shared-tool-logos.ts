type Mark = { name: string; logo: string; mono?: boolean }
type Content = Record<string, unknown>
const identity = (name: string) => name.trim().toLowerCase()
const placeholder = (logo: string) => /\/images\/tools\/tool-\d+\.svg(?:[?#].*)?$/.test(logo)

function marks(value: unknown, result: Mark[] = []): Mark[] {
  if (Array.isArray(value)) value.forEach(item => marks(item, result))
  else if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    if (typeof object.name === 'string' && typeof object.logo === 'string') result.push(object as Mark)
    else Object.values(object).forEach(item => marks(item, result))
  }
  return result
}

/** Older backups stored independent copies. Recover uploaded logos wherever they were edited. */
export function sharedToolLogos(content: Content): Content {
  const next = structuredClone(content)
  const all = [...marks(next.tools), ...Object.entries(next).filter(([key]) => key !== 'tools').flatMap(([, value]) => marks(value))]
  const selected = new Map<string, Mark>()
  for (const mark of all) {
    const key = identity(mark.name)
    const current = selected.get(key)
    if (!current || (placeholder(current.logo) && mark.logo && !placeholder(mark.logo))) selected.set(key, mark)
  }
  for (const mark of all) {
    const source = selected.get(identity(mark.name))!
    mark.logo = source.logo
    if (source.mono === undefined) delete mark.mono
    else mark.mono = source.mono
  }
  return next
}

/** An edit to one skill logo updates its matching instances, including hidden project faces. */
export function editToolLogos(content: Content, section: string, value: unknown): Content {
  const next = structuredClone({ ...content, [section]: value })
  const changes: { previous: string; mark: Mark }[] = []
  const before = marks(content[section])
  for (const updated of marks(value)) {
    const old = before.find(mark => identity(mark.name) === identity(updated.name))
    if (old && (old.logo !== updated.logo || old.mono !== updated.mono)) changes.push({ previous: identity(old.name), mark: updated })
  }
  for (const { previous, mark: changed } of changes) {
    for (const mark of marks(next)) if (identity(mark.name) === previous) {
      mark.name = changed.name
      mark.logo = changed.logo
      if (changed.mono === undefined) delete mark.mono
      else mark.mono = changed.mono
    }
  }
  return next
}

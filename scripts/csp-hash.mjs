// Prints the sha256 of the inline theme script in index.html and checks deploy/headers.conf allows it.
// The production CSP allows exactly that one inline script by hash, so an edited script with a stale hash
// is blocked and the site paints in the wrong theme. Usage: npm run csp:check  (exits 1 on drift)
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const scripts = [...read('index.html').matchAll(/<script>([\s\S]*?)<\/script>/g)]
if (scripts.length !== 1) {
  console.error(`csp-hash: expected one inline <script> in index.html, found ${scripts.length}`)
  process.exit(1)
}
const hash = `sha256-${createHash('sha256').update(scripts[0][1]).digest('base64')}`
const ok = read('deploy/headers.conf').includes(`'${hash}'`)
console.log(`index.html inline script: '${hash}'`)
console.log(ok ? 'deploy/headers.conf allows it' : 'DRIFT: put this hash in the script-src of deploy/headers.conf')
process.exit(ok ? 0 : 1)

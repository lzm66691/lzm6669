import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const APP = 'C:\\Users\\鸣\\AppData\\Local\\Programs\\DSH Desktop\\resources\\app'
const ANCHOR = process.env.APPDATA + '\\dsh-desktop\\harness\\profiles\\node_modules'

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
const req = createRequire(path.join(APP, 'noop.js'))

// Reproduce resolveModuleFallbackEntries: walk deps + peerDeps from the app manifest.
const links = new Map()
const appManifest = readJson(path.join(APP, 'package.json'))
if (appManifest?.name) links.set(appManifest.name, APP)

const queue = [{ dir: APP, manifest: appManifest }]
while (queue.length) {
  const next = queue.shift()
  const names = [...Object.keys(next.manifest?.dependencies ?? {}), ...Object.keys(next.manifest?.peerDependencies ?? {})]
  for (const dep of names) {
    if (links.has(dep) || dep === appManifest.name) continue
    let pkgJson
    try { pkgJson = req.resolve(dep + '/package.json') } catch { continue }
    const dir = path.dirname(pkgJson)
    links.set(dep, dir)
    queue.push({ dir, manifest: readJson(pkgJson) })
  }
}

// What the anchor actually exposes.
const actual = new Set()
for (const e of fs.readdirSync(ANCHOR, { withFileTypes: true })) {
  if (e.name.startsWith('@')) {
    if (!e.isDirectory()) continue
    for (const c of fs.readdirSync(path.join(ANCHOR, e.name))) actual.add(`${e.name}/${c}`)
  } else actual.add(e.name)
}

const missing = [...links.keys()].filter((n) => !actual.has(n)).sort()
const relink = []
for (const [name, dir] of links) {
  const link = path.join(ANCHOR, name)
  let cur = null
  try { cur = fs.readlinkSync(link) } catch { }
  if (cur !== null && path.resolve(cur) !== path.resolve(dir)) relink.push(`${name}: ${cur} != ${dir}`)
}

console.log(`expected closure entries : ${links.size}`)
console.log(`present at anchor        : ${actual.size}`)
console.log(`\nMISSING (${missing.length}):`)
for (const n of missing) console.log(`  ${n}  ->  ${links.get(n)}`)
console.log(`\nWRONG TARGET (${relink.length}):`)
for (const r of relink) console.log(`  ${r}`)

if (missing.includes('react-dom')) {
  console.log('\n>>> react-dom missing from anchor; app has it at:')
  console.log('    ' + path.join(APP, 'node_modules', 'react-dom'))
}

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const HOME = process.env.APPDATA + '\\dsh-desktop\\harness'
const PROFILE = path.join(HOME, 'profiles', 'web')
const NM = path.join(PROFILE, 'node_modules')

const pkg = JSON.parse(fs.readFileSync(path.join(PROFILE, 'package.json'), 'utf8'))
const declared = Object.keys(pkg.dependencies ?? {})
const bundles = pkg.dsh?.profile?.bundles ?? []

const readManifest = (dir) => {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) } catch { return null }
}

const resolves = (fromDir, name) => {
  try {
    createRequire(path.join(fromDir, 'noop.js')).resolve(name + '/package.json')
    return true
  } catch {
    try { createRequire(path.join(fromDir, 'noop.js')).resolve(name); return true } catch { return false }
  }
}

const list = []
for (const name of declared) {
  const dir = path.join(NM, ...name.split('/'))
  const m = readManifest(dir)
  if (!m) { list.push({ name, status: 'MISSING', note: 'not installed' }); continue }

  const peers = { ...(m.peerDependencies ?? {}) }
  const optional = new Set(Object.keys(m.peerDependenciesMeta ?? {}).filter(k => m.peerDependenciesMeta[k]?.optional))
  const missing = []
  const missingRequired = []
  for (const dep of Object.keys(peers)) {
    if (resolves(dir, dep)) continue
    missing.push(dep)
    if (!optional.has(dep)) missingRequired.push(dep)
  }
  const deps = Object.keys(m.dependencies ?? {})
  const missingRuntime = deps.filter(d => !resolves(dir, d))

  list.push({
    name,
    version: m.version,
    inBundles: bundles.includes(name),
    peerCount: Object.keys(peers).length,
    missingOptional: missing.filter(d => optional.has(d)),
    missingRequired,
    missingRuntime,
    hasClient: Boolean(m.exports || m.main),
  })
}

const out = []
out.push(`profile: ${PROFILE}`)
out.push(`declared plugins: ${declared.length} | in bundles roster: ${bundles.length}`)
out.push(`bundles: ${bundles.join(', ')}`)
out.push('')
for (const p of list) {
  if (p.status === 'MISSING') { out.push(`[NOT INSTALLED] ${p.name}`); continue }
  const bad = p.missingRequired.length > 0 || p.missingRuntime.length > 0
  out.push(`${bad ? '[BROKEN]' : '[ok]    '} ${p.name}@${p.version}${p.inBundles ? '' : '  (NOT in roster)'}`)
  if (p.missingRequired.length) out.push(`   missing REQUIRED peers: ${p.missingRequired.join(', ')}`)
  if (p.missingRuntime.length) out.push(`   missing runtime deps : ${p.missingRuntime.join(', ')}`)
  if (p.missingOptional.length) out.push(`   missing opts (ok)    : ${p.missingOptional.length}`)
}
console.log(out.join('\n'))

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const HOME = process.env.APPDATA + '\\dsh-desktop\\harness'
const PROFILE = path.join(HOME, 'profiles', 'web')
const NM = path.join(PROFILE, 'node_modules')

const pkg = JSON.parse(fs.readFileSync(path.join(PROFILE, 'package.json'), 'utf8'))
const declared = Object.keys(pkg.dependencies ?? {})

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null } }
const resolveFrom = (dir, name) => {
  try { return createRequire(path.join(dir, 'noop.js')).resolve(name + '/package.json') } catch { return null }
}

let failures = 0
const out = []
out.push(`profile : ${PROFILE}`)
out.push(`declared: ${declared.length} packages`)
out.push(`react-dom declared: ${declared.includes('react-dom') ? 'yes' : 'NO'}`)
out.push('')

// 1. package entry points — catches a half-replaced package from an interrupted install.
out.push('--- plugin entry points ---')
for (const name of declared) {
  const dir = path.join(NM, ...name.split('/'))
  const m = readJson(path.join(dir, 'package.json'))
  if (!m) { out.push(`  FAIL ${name}: dir or manifest missing`); failures++; continue }
  const entry = m.main ?? (typeof m.exports === 'string' ? m.exports : null)
  let ok = true
  if (entry) {
    const abs = path.join(dir, entry)
    ok = fs.existsSync(abs) || fs.existsSync(abs + '.js') || fs.existsSync(path.join(abs, 'index.js'))
  }
  if (!ok) failures++
  out.push(`  ${ok ? 'ok  ' : 'FAIL'} ${name}@${m.version}${entry ? ` -> ${entry}` : ''}`)
}

// 2. every required peer resolves from the plugin that declares it
out.push('')
out.push('--- required peers ---')
for (const name of declared) {
  const dir = path.join(NM, ...name.split('/'))
  const m = readJson(path.join(dir, 'package.json'))
  if (!m) continue
  const meta = m.peerDependenciesMeta ?? {}
  const missing = Object.keys(m.peerDependencies ?? {})
    .filter((d) => !meta[d]?.optional)
    .filter((d) => resolveFrom(dir, d) === null)
  if (missing.length) { failures++; out.push(`  FAIL ${name}: ${missing.join(', ')}`) }
  else out.push(`  ok   ${name}`)
}

// 3. leftovers from an interrupted pnpm run
out.push('')
out.push('--- leftovers ---')
const stray = fs.readdirSync(NM).filter((n) => /_tmp_\d+_\d+$/.test(n) || /\.dsh-old-/.test(n))
out.push(`  staging/sideline dirs: ${stray.length}${stray.length ? ' -> ' + stray.join(', ') : ''}`)
if (stray.length) failures++

// 4. react-dom reachable from the three plugins that needed it
out.push('')
out.push('--- react-dom reachability ---')
for (const name of ['dsh-better-sidebar', 'dsh-mcp-connector', 'dsh-mnemon']) {
  const dir = path.join(NM, name)
  if (!fs.existsSync(dir)) { out.push(`  ${name}: plugin absent`); continue }
  const r = resolveFrom(dir, 'react-dom')
  const v = r ? readJson(r)?.version : null
  if (!v) failures++
  out.push(`  ${v ? 'ok  ' : 'FAIL'} ${name} -> react-dom ${v ?? 'MISSING'}`)
}

out.push('')
out.push(failures === 0 ? 'RESULT: healthy' : `RESULT: ${failures} problem(s)`)
console.log(out.join('\n'))

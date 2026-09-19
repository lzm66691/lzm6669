import fs from 'node:fs'

const raw = fs.readFileSync(process.env.TEMP + '/dsh-plugins.json', 'utf8')
const j = JSON.parse(raw)
const plugins = j.plugins

const line = (p) => {
  const d = (p.description?.en ?? '').slice(0, 170)
  return `${String(p.downloads ?? 0).padStart(7)} dl | ${String(p.stars ?? '-').padStart(5)} stars | [${p.category}] ${p.name}\n        npm=${p.npm ?? '-'}\n        ${p.install}\n        ${d}`
}

const withDl = plugins.filter(p => p.downloads)
withDl.sort((a, b) => b.downloads - a.downloads)

const out = []
out.push('=== TOP 60 BY NPM DOWNLOADS (all categories) ===')
out.push(...withDl.slice(0, 60).map(line))

out.push('\n=== TOP 8 PER CATEGORY BY DOWNLOADS ===')
for (const cat of Object.keys(j.categories)) {
  const l = withDl.filter(p => p.category === cat).slice(0, 8)
  out.push(`\n--- ${cat} (${j.categories[cat].zh}) ---`)
  out.push(...l.map(line))
}

fs.writeFileSync('ranked.txt', out.join('\n'), 'utf8')
console.log('written', out.length, 'lines; plugins with downloads:', withDl.length)

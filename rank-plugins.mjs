import fs from 'node:fs'

const raw = fs.readFileSync(process.env.TEMP + '/dsh-plugins.json', 'utf8')
const j = JSON.parse(raw)
const plugins = j.plugins

const score = (p) => (p.stars ?? 0) * 10 + Math.log10((p.downloads ?? 0) + 1) * 25

const cats = process.argv.slice(2)
let list = cats.length ? plugins.filter(p => cats.includes(p.category)) : plugins
list = list.filter(p => (p.stars ?? 0) >= 5 || (p.downloads ?? 0) >= 800)
list.sort((a, b) => score(b) - score(a))

console.log(`total=${j.count} candidates=${list.length}`)
for (const p of list.slice(0, 80)) {
  console.log([
    `${p.name} [${p.category}]`,
    `stars=${p.stars ?? '-'} dl=${p.downloads ?? '-'}`,
    `npm=${p.npm ?? '-'}`,
    `install=${p.install}`,
  ].join(' | '))
  console.log(`   EN: ${(p.description?.en ?? '').slice(0, 200)}`)
  console.log(`   ZH: ${(p.description?.zh ?? '').slice(0, 200)}`)
}

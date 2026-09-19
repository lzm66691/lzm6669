import fs from 'node:fs'

const raw = fs.readFileSync(process.env.TEMP + '/dsh-plugins.json', 'utf8')
const j = JSON.parse(raw)

const isSkill = (p) => p.category === 'skill' ||
  /(^|[^a-z])skill/i.test(p.name) ||
  /技能|skill pack|skills pack|技能包/i.test((p.description?.zh ?? '') + ' ' + (p.description?.en ?? ''))

const list = j.plugins.filter(isSkill).sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))

const fmt = (p) => [
  `${String(p.downloads ?? 0).padStart(7)} dl | ${String(p.stars ?? '-').padStart(5)} ★ | [${p.category}] ${p.name}`,
  `   npm=${p.npm ?? '-'}`,
  `   ${p.install}`,
  `   ZH: ${(p.description?.zh ?? '').slice(0, 330)}`,
].join('\n')

console.log(`=== 技能类候选 ${list.length} 个，按下载量前 45 ===\n`)
for (const p of list.slice(0, 45)) console.log(fmt(p) + '\n')

console.log('\n=== 只看 category=skill 的 ===')
for (const p of j.plugins.filter(x => x.category === 'skill').sort((a,b)=>(b.downloads??0)-(a.downloads??0))) {
  console.log(fmt(p) + '\n')
}

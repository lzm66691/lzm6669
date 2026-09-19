import fs from 'node:fs'

const j = JSON.parse(fs.readFileSync(process.env.TEMP + '/dsh-plugins.json', 'utf8'))
const re = /(背景|壁纸|wallpaper|background|backdrop|皮肤|skin|theme|主题|美化|外观|图片背景|bg)/i
const hit = (p) => re.test(p.name) || re.test(p.description?.en ?? '') || re.test(p.description?.zh ?? '')

const list = j.plugins.filter(hit).sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))

const fmt = (p) => [
  `${String(p.downloads ?? 0).padStart(7)} dl | ${String(p.stars ?? '-').padStart(5)} ★ | [${p.category}] ${p.name}`,
  `   npm=${p.npm ?? '-'}`,
  `   ${p.install}`,
  `   ZH: ${(p.description?.zh ?? '').slice(0, 300)}`,
].join('\n')

console.log(`=== 背景/壁纸/皮肤类共 ${list.length} 个，按下载量前 40 ===\n`)
for (const p of list.slice(0, 40)) console.log(fmt(p) + '\n')

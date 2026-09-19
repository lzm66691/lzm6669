import fs from 'node:fs'

const j = JSON.parse(fs.readFileSync(process.env.TEMP + '/dsh-plugins.json', 'utf8'))

// 桌宠 + 鲸鱼娘/鱼女仆 + 余额 相关关键词
const petKw = /(pet|桌宠|桌宠|mascot|companion|whale|鲸|鱼|maid|女仆|live2d|spine|sprite)/i
const balKw = /(余额|balance|token\s*(余额|用量)|用量|usage|billing|费用|cost|quota|额度)/i

const hit = (p, re) => re.test(p.name) || re.test(p.description?.en ?? '') || re.test(p.description?.zh ?? '')

const pets = j.plugins.filter(p => hit(p, petKw))
const withBal = pets.filter(p => hit(p, balKw))

const fmt = (p) => [
  `${p.name}  [${p.category}]  stars=${p.stars ?? '-'} dl=${p.downloads ?? '-'}`,
  `  npm=${p.npm ?? '-'}`,
  `  install=${p.install}`,
  `  ZH: ${(p.description?.zh ?? '').slice(0, 320)}`,
  p.screenshots?.length ? `  shots: ${p.screenshots.join(' | ')}` : '  shots: (none)',
].join('\n')

console.log(`=== 桌宠类共 ${pets.length} 个，其中带余额/用量 = ${withBal.length} 个 ===\n`)
console.log('### A. 桌宠 AND 余额/用量 ###')
for (const p of withBal) console.log(fmt(p) + '\n')

console.log('### B. 其余桌宠（按下载量前 12） ###')
const rest = pets.filter(p => !withBal.includes(p)).sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
for (const p of rest.slice(0, 12)) console.log(fmt(p) + '\n')

console.log('### C. 纯余额/用量件（非桌宠，按下载量前 10） ###')
const balOnly = j.plugins.filter(p => hit(p, balKw) && !pets.includes(p)).sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
for (const p of balOnly.slice(0, 10)) console.log(fmt(p) + '\n')

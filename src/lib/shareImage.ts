// Renders an ayah card to a PNG entirely in the browser (Canvas) — no image service.

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > max && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}

export async function renderAyahImage(ar: string, en: string, ref: string, dark = true) {
  const W = 1080, H = 1350, P = 90
  await document.fonts.load('60px "Amiri Quran"', ar)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  const bg = dark ? '#0b2a24' : '#f6f3ec', ink = dark ? '#ffffff' : '#17231f', gold = dark ? '#d8b261' : '#a37a2c', muted = dark ? 'rgba(255,255,255,.72)' : '#4b5a54'

  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
  // geometric star pattern
  ctx.strokeStyle = gold; ctx.globalAlpha = 0.12; ctx.lineWidth = 2
  for (let y = 0; y < H + 90; y += 90) for (let x = 0; x < W + 90; x += 90) {
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? 14 : 38, ang = (Math.PI / 4) * i - Math.PI / 2
      ctx.lineTo(x + r * Math.cos(ang), y + r * Math.sin(ang))
    }
    ctx.closePath(); ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.strokeStyle = gold; ctx.lineWidth = 3
  ctx.strokeRect(40, 40, W - 80, H - 80)

  // Arabic — shrink font until it fits
  let size = 72, arLines: string[] = [], enLines: string[] = []
  for (; size >= 34; size -= 4) {
    ctx.font = `${size}px "Amiri Quran"`; ctx.direction = 'rtl'
    arLines = wrap(ctx, ar, W - P * 2)
    ctx.font = '34px Inter Variable, sans-serif'; ctx.direction = 'ltr'
    enLines = wrap(ctx, en, W - P * 2)
    if (arLines.length * size * 2 + enLines.length * 50 < H - 380) break
  }
  const block = arLines.length * size * 2 + 60 + enLines.length * 50
  let y = (H - block) / 2 + size

  ctx.textAlign = 'center'; ctx.fillStyle = ink; ctx.direction = 'rtl'; ctx.font = `${size}px "Amiri Quran"`
  for (const l of arLines) { ctx.fillText(l, W / 2, y); y += size * 2 }
  y += 20
  ctx.direction = 'ltr'; ctx.fillStyle = muted; ctx.font = '34px Inter Variable, sans-serif'
  for (const l of enLines) { ctx.fillText(l, W / 2, y); y += 50 }

  ctx.fillStyle = gold; ctx.font = '600 34px Inter Variable, sans-serif'
  ctx.fillText(ref, W / 2, H - 130)
  ctx.globalAlpha = 0.6; ctx.fillStyle = ink; ctx.font = '26px Inter Variable, sans-serif'
  ctx.fillText('Noor · Quran', W / 2, H - 85)

  return new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'))
}

export async function shareAyahImage(ar: string, en: string, ref: string) {
  const dark = document.documentElement.dataset.theme === 'dark'
  const blob = await renderAyahImage(ar, en, ref, dark)
  const file = new File([blob], `quran-${ref.replace(/[^\d]+/g, '-')}.png`, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: ref }); return 'shared' } catch { /* cancelled */ }
  }
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), { href: url, download: file.name }).click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}

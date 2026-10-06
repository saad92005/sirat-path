import { getSettings } from './settings'

let ctx: AudioContext | null = null

/** Haptic + optional soft click (generated with Web Audio — no sound files). */
export function tap(strong = false) {
  navigator.vibrate?.(strong ? [40, 30, 40] : 8)
  if (!getSettings().sound) return
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.frequency.value = strong ? 880 : 520
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08)
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.09)
  } catch { /* audio unavailable */ }
}

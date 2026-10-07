// Compass helpers for the Qibla finder.
// Phones report heading relative to *magnetic* north; the Qibla bearing is relative to *true* north,
// so we add the local magnetic declination from the World Magnetic Model (WMM 2025, via `geomagnetism`).
import geomagnetism from 'geomagnetism'

export const KAABA = { lat: 21.422487, lng: 39.826206 }

/** Magnetic declination in degrees (east positive) for a point today. */
export function declination(lat: number, lng: number): number {
  try { return geomagnetism.model(new Date(), { allowOutOfBoundsModel: true }).point([lat, lng]).decl } catch { return 0 }
}

/**
 * Tilt-compensated compass heading (deg clockwise from magnetic north) from W3C Euler angles (Z-X'-Y'').
 * Phone lying flat-ish: heading of the device's top edge. Phone held upright: heading of the back camera
 * (the direction the user is looking through the screen). Both are projected onto the horizontal plane.
 */
export function headingFromEuler(alpha: number, beta: number, gamma: number): number {
  const r = Math.PI / 180
  const cA = Math.cos(alpha * r), sA = Math.sin(alpha * r)
  const cB = Math.cos(beta * r), sB = Math.sin(beta * r)
  const cG = Math.cos(gamma * r), sG = Math.sin(gamma * r)
  let east: number, north: number
  if (Math.abs(cB) > 0.5) { // top edge (device +Y) in earth frame
    east = -sA * cB; north = cA * cB
  } else { // back camera (device -Z) in earth frame
    east = -cA * sG - sA * sB * cG; north = -sA * sG + cA * sB * cG
  }
  return norm(Math.atan2(east, north) / r)
}

export const norm = (d: number) => ((d % 360) + 360) % 360
/** Signed smallest difference a→b in (-180, 180]. */
export const delta = (a: number, b: number) => ((b - a + 540) % 360) - 180

/** Points along the great circle between two coordinates (for drawing the Qibla line on a map). */
export function greatCircle(a: { lat: number; lng: number }, b: { lat: number; lng: number }, n = 64): [number, number][] {
  const r = Math.PI / 180
  const [φ1, λ1, φ2, λ2] = [a.lat * r, a.lng * r, b.lat * r, b.lng * r]
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2))
  if (d === 0) return [[a.lat, a.lng]]
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
    const z = A * Math.sin(φ1) + B * Math.sin(φ2)
    pts.push([Math.atan2(z, Math.hypot(x, y)) / r, Math.atan2(y, x) / r])
  }
  return pts
}

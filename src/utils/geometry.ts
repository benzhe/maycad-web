import type { Profile } from '../types'

// Get the two endpoints of a profile (in mm)
export function getProfileEndpoints(profile: Profile): [[number, number, number], [number, number, number]] {
  const { position, rotation, length } = profile
  const rad = (rotation * Math.PI) / 180
  const dx = Math.cos(rad) * length
  const dz = Math.sin(rad) * length
  return [
    [position[0], position[1], position[2]],
    [position[0] + dx, position[1], position[2] + dz],
  ]
}

export function distance3D(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

// Check if two profiles have endpoints within threshold mm of each other
export function findNearbyEndpoints(
  p1: Profile,
  p2: Profile,
  threshold = 50
): [number, number, number] | null {
  const eps1 = getProfileEndpoints(p1)
  const eps2 = getProfileEndpoints(p2)
  for (const ep1 of eps1) {
    for (const ep2 of eps2) {
      if (distance3D(ep1, ep2) <= threshold) {
        return [
          (ep1[0] + ep2[0]) / 2,
          (ep1[1] + ep2[1]) / 2,
          (ep1[2] + ep2[2]) / 2,
        ]
      }
    }
  }
  return null
}

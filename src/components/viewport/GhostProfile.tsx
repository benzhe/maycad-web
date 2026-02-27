import type { Profile } from '../../types'

interface GhostProfileProps {
  profile: Omit<Profile, 'instanceId'>
  position: [number, number, number]
}

export default function GhostProfile({ profile, position }: GhostProfileProps) {
  const W = profile.width
  const H = profile.height
  const L = profile.length
  const rotRad = (profile.rotation * Math.PI) / 180

  const cx = position[0] + (Math.cos(rotRad) * L) / 2
  const cy = position[1] + H / 2
  const cz = position[2] + (Math.sin(rotRad) * L) / 2

  return (
    <group position={[cx, cy, cz]} rotation={[0, -rotRad, 0]}>
      <mesh>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial color="#4488ff" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

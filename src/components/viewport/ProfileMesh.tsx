import { useRef } from 'react'
import * as THREE from 'three'
import type { Profile } from '../../types'
import { useCADStore } from '../../store/cadStore'
import type { ThreeEvent } from '@react-three/fiber'

interface ProfileMeshProps {
  profile: Profile
}

export default function ProfileMesh({ profile }: ProfileMeshProps) {
  const { selectedIds, selectProfile, activeTool } = useCADStore()
  const isSelected = selectedIds.includes(profile.instanceId)
  const meshRef = useRef<THREE.Mesh>(null)

  const W = profile.width
  const H = profile.height
  const L = profile.length
  const rotRad = (profile.rotation * Math.PI) / 180

  const cx = profile.position[0] + (Math.cos(rotRad) * L) / 2
  const cy = profile.position[1] + H / 2
  const cz = profile.position[2] + (Math.sin(rotRad) * L) / 2

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (activeTool === 'select' || activeTool === 'move') {
      selectProfile(profile.instanceId, e.nativeEvent?.ctrlKey || false)
    }
  }

  const edgesGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(L + 2, H + 2, W + 2))

  return (
    <group position={[cx, cy, cz]} rotation={[0, -rotRad, 0]}>
      <mesh ref={meshRef} onClick={handleClick} castShadow receiveShadow>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial
          color={isSelected ? '#ffdd44' : profile.color}
          metalness={0.6}
          roughness={0.3}
          emissive={isSelected ? '#332200' : '#000000'}
        />
      </mesh>
      {isSelected && (
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial color="#ffdd44" />
        </lineSegments>
      )}
    </group>
  )
}

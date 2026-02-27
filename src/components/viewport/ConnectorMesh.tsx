import type { ConnectorInstance } from '../../types'
import { useCADStore } from '../../store/cadStore'
import type { ThreeEvent } from '@react-three/fiber'

interface ConnectorMeshProps {
  connector: ConnectorInstance
}

export default function ConnectorMesh({ connector }: ConnectorMeshProps) {
  const { selectedIds, selectProfile } = useCADStore()
  const isSelected = selectedIds.includes(connector.instanceId)

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    selectProfile(connector.instanceId, e.nativeEvent?.ctrlKey || false)
  }

  return (
    <mesh position={connector.position} onClick={handleClick}>
      <sphereGeometry args={[15, 8, 8]} />
      <meshStandardMaterial color={isSelected ? '#ffdd44' : '#ff8800'} metalness={0.4} roughness={0.4} />
    </mesh>
  )
}

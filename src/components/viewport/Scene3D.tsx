import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useCADStore } from '../../store/cadStore'
import { profileLibrary } from '../../data/profiles'
import { connectorLibrary } from '../../data/connectors'
import { findNearbyEndpoints } from '../../utils/geometry'
import ProfileMesh from './ProfileMesh'
import GhostProfile from './GhostProfile'
import ConnectorMesh from './ConnectorMesh'
import { v4 as uuidv4 } from 'uuid'
import type { Profile, ConnectorInstance, ConnectorType } from '../../types'

const CONNECTOR_SUGGESTION_THRESHOLD_MM = 60

function SceneContent() {
  const {
    profiles, connectors, activeTool, activeProfileType,
    addProfile, deselectAll, setConnectorSuggestion,
  } = useCADStore()

  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null)
  const orbitRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)

  const activeType = activeProfileType ? profileLibrary.find(p => p.id === activeProfileType) : null

  function handlePlaneClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (activeTool === 'select') {
      deselectAll()
      return
    }
    if (activeTool === 'profile' && activeType && ghostPos) {
      const newProfile: Profile = {
        id: activeType.id,
        instanceId: uuidv4(),
        name: activeType.name,
        width: activeType.width,
        height: activeType.height,
        length: 500,
        position: [ghostPos[0], ghostPos[1], ghostPos[2]],
        rotation: 0,
        articleNumber: activeType.articleNumber,
        weightPerMeter: activeType.weightPerMeter,
        slots: activeType.slots,
        color: '#b0b0be',
        excluded: false,
      }
      addProfile(newProfile)

      // Check for nearby connectors after adding
      for (const existing of profiles) {
        const pt = findNearbyEndpoints(existing, newProfile, CONNECTOR_SUGGESTION_THRESHOLD_MM)
        if (pt) {
          setConnectorSuggestion({
            profile1Id: existing.instanceId,
            profile2Id: newProfile.instanceId,
            position: pt,
            suggestedConnectors: connectorLibrary.filter(c => c.compatibleSlots.includes(existing.slots)),
          })
          break
        }
      }
    }
  }

  function handlePlaneMove(e: ThreeEvent<PointerEvent>) {
    if (activeTool === 'profile' && activeType) {
      const pt = e.point
      setGhostPos([pt.x, 0, pt.z])
    }
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[1000, 2000, 1000]} intensity={0.8} castShadow />
      <directionalLight position={[-1000, 500, -1000]} intensity={0.3} />

      {/* Click/move capture plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handlePlaneClick}
        onPointerMove={handlePlaneMove}
        visible={false}
      >
        <planeGeometry args={[100000, 100000]} />
        <meshBasicMaterial />
      </mesh>

      {/* Grid */}
      <Grid
        args={[10000, 10000]}
        cellSize={100}
        cellThickness={0.5}
        cellColor="#2a3a5e"
        sectionSize={500}
        sectionThickness={1}
        sectionColor="#3a4a6e"
        fadeDistance={8000}
        fadeStrength={1}
        position={[0, 0, 0]}
      />

      {/* Profiles */}
      {profiles.map(p => <ProfileMesh key={p.instanceId} profile={p} />)}

      {/* Connectors */}
      {connectors.map(c => <ConnectorMesh key={c.instanceId} connector={c} />)}

      {/* Ghost preview */}
      {activeTool === 'profile' && activeType && ghostPos && (
        <GhostProfile
          profile={{
            id: activeType.id,
            name: activeType.name,
            width: activeType.width,
            height: activeType.height,
            length: 500,
            position: ghostPos,
            rotation: 0,
            articleNumber: activeType.articleNumber,
            weightPerMeter: activeType.weightPerMeter,
            slots: activeType.slots,
            color: '#4488ff',
            excluded: false,
          }}
          position={ghostPos}
        />
      )}

      <axesHelper args={[200]} />
      <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#e94560', '#44ff44', '#4488ff']} labelColor="white" />
      </GizmoHelper>
    </>
  )
}

function ConnectorSuggestionOverlay() {
  const { connectorSuggestion, setConnectorSuggestion, addConnector } = useCADStore()
  if (!connectorSuggestion) return null

  const suggestion = connectorSuggestion
  function accept(connectorType: ConnectorType) {
    if (!suggestion) return
    const inst: ConnectorInstance = {
      id: connectorType.id,
      instanceId: uuidv4(),
      connectorType: connectorType.name,
      position: suggestion.position,
      profileIds: [suggestion.profile1Id, suggestion.profile2Id],
      articleNumber: connectorType.articleNumber,
      weight: connectorType.weight,
      excluded: false,
    }
    addConnector(inst)
    setConnectorSuggestion(null)
  }

  return (
    <div style={{
      position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#16213e', border: '1px solid #e94560', borderRadius: 8,
      padding: 12, zIndex: 100, minWidth: 260,
    }}>
      <div className="text-sm font-semibold text-gray-200 mb-2">Connector Suggestion</div>
      <div className="text-xs text-gray-400 mb-2">Nearby profiles detected. Add connector?</div>
      <div className="flex flex-col gap-1 mb-2">
        {connectorSuggestion.suggestedConnectors.slice(0, 4).map(c => (
          <button key={c.id} onClick={() => accept(c)}
            className="px-2 py-1 rounded text-xs text-left"
            style={{ background: '#0f3460', color: '#ccc', border: '1px solid #1a3a6e', cursor: 'pointer' }}>
            {c.name} <span className="text-gray-500">{c.articleNumber}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setConnectorSuggestion(null)}
        className="w-full py-1 rounded text-xs"
        style={{ background: '#3a1010', color: '#f88', border: '1px solid #5a2020', cursor: 'pointer' }}>
        Skip
      </button>
    </div>
  )
}

export default function Scene3D() {
  const { profiles } = useCADStore()

  return (
    <div className="flex-1 relative" style={{ background: '#1a1a2e' }}>
      <Canvas
        camera={{ position: [800, 800, 1200], fov: 45, near: 1, far: 50000 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContent />
      </Canvas>
      <ConnectorSuggestionOverlay />
      {/* Profiles count badge */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        background: 'rgba(15,52,96,0.85)', borderRadius: 6,
        padding: '4px 10px', fontSize: 11, color: '#ccc',
      }}>
        {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

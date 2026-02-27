import { useCADStore } from '../store/cadStore'

export default function StatusBar() {
  const { activeTool, units, profiles, connectors, selectedIds } = useCADStore()
  const totalWeight = profiles.reduce((s, p) => s + p.weightPerMeter * p.length / 1000, 0)

  const toolHints: Record<string, string> = {
    select: 'Click to select • Ctrl+click for multi-select',
    move: 'Click and drag to move selected profiles',
    profile: 'Click in viewport to place profile',
    connector: 'Click near profile junction to add connector',
    hole: 'Click on profile to add hole',
    measure: 'Click two points to measure distance',
  }

  return (
    <div
      className="flex items-center gap-4 px-3 text-xs"
      style={{ background: '#0f3460', borderTop: '1px solid #1a3a6e', height: 24, color: '#888' }}
    >
      <span>Tool: <span style={{ color: '#e94560' }}>{activeTool}</span></span>
      <span style={{ color: '#555' }}>|</span>
      <span>{toolHints[activeTool]}</span>
      <span style={{ color: '#555' }}>|</span>
      <span>Profiles: <span style={{ color: '#ccc' }}>{profiles.length}</span></span>
      <span>Connectors: <span style={{ color: '#ccc' }}>{connectors.length}</span></span>
      <span>Selected: <span style={{ color: '#ccc' }}>{selectedIds.length}</span></span>
      <span style={{ color: '#555' }}>|</span>
      <span>Total Weight: <span style={{ color: '#ccc' }}>{totalWeight.toFixed(2)} kg</span></span>
      <div className="flex-1" />
      <span>Units: <span style={{ color: '#ccc' }}>{units}</span></span>
      <span style={{ color: '#555' }}>|</span>
      <span style={{ color: '#555' }}>MayCAD v1.0</span>
    </div>
  )
}

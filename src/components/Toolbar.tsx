import { useCADStore } from '../store/cadStore'
import type { Tool } from '../types'
import { createSimpleFrame, createWorkbench, createMachineGuard } from '../data/templates'
import { generateBOM, exportBOMasCSV } from '../utils/bom'

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'move', label: 'Move', icon: '✥' },
  { id: 'profile', label: 'Profile', icon: '▬' },
  { id: 'connector', label: 'Connector', icon: '⊕' },
  { id: 'hole', label: 'Hole', icon: '○' },
  { id: 'measure', label: 'Measure', icon: '↔' },
]

export default function Toolbar() {
  const { activeTool, setActiveTool, units, setUnits, profiles, connectors, loadScene, clearScene } = useCADStore()

  function handleSaveScene() {
    const scene = { profiles, connectors, units, version: '1.0' }
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scene.maycad'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleLoadScene() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.maycad,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const scene = JSON.parse(ev.target?.result as string)
          loadScene(scene.profiles || [], scene.connectors || [], scene.units || 'metric')
        } catch { /* ignore parse errors */ }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  function handleExportCSV() {
    const bom = generateBOM(profiles, connectors)
    const csv = exportBOMasCSV(bom)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bom.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleTemplate(name: string) {
    let templateProfiles
    if (name === 'frame') templateProfiles = createSimpleFrame()
    else if (name === 'workbench') templateProfiles = createWorkbench()
    else templateProfiles = createMachineGuard()
    clearScene()
    loadScene(templateProfiles, [], units)
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 select-none" style={{ background: '#0f3460', borderBottom: '1px solid #1a1a4e', height: 48 }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <span className="font-bold text-lg" style={{ color: '#e94560' }}>May</span>
        <span className="font-bold text-lg text-white">CAD</span>
      </div>

      {/* Tools */}
      <div className="flex gap-1 mr-4">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            title={t.label}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              background: activeTool === t.id ? '#e94560' : '#1a3a6e',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              minWidth: 52,
            }}
          >
            <div>{t.icon}</div>
            <div style={{ fontSize: 10 }}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 32, background: '#1a3a6e', margin: '0 8px' }} />

      {/* Templates */}
      <div className="flex items-center gap-1 mr-2">
        <span className="text-xs text-gray-400 mr-1">Templates:</span>
        {[
          { key: 'frame', label: 'Frame 1m³' },
          { key: 'workbench', label: 'Workbench' },
          { key: 'guard', label: 'Machine Guard' },
        ].map(t => (
          <button key={t.key} onClick={() => handleTemplate(t.key)}
            className="px-2 py-1 rounded text-xs"
            style={{ background: '#1a3a6e', color: '#ccc', border: '1px solid #2a4a8e', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 32, background: '#1a3a6e', margin: '0 8px' }} />

      {/* File actions */}
      <div className="flex gap-1 mr-2">
        <button onClick={clearScene} className="px-2 py-1 rounded text-xs" style={{ background: '#3a1010', color: '#f88', border: '1px solid #5a2020', cursor: 'pointer' }}>New</button>
        <button onClick={handleSaveScene} className="px-2 py-1 rounded text-xs" style={{ background: '#1a3a6e', color: '#ccc', border: '1px solid #2a4a8e', cursor: 'pointer' }}>Save</button>
        <button onClick={handleLoadScene} className="px-2 py-1 rounded text-xs" style={{ background: '#1a3a6e', color: '#ccc', border: '1px solid #2a4a8e', cursor: 'pointer' }}>Open</button>
        <button onClick={handleExportCSV} className="px-2 py-1 rounded text-xs" style={{ background: '#1a3a6e', color: '#ccc', border: '1px solid #2a4a8e', cursor: 'pointer' }}>Export CSV</button>
        <button className="px-2 py-1 rounded text-xs" style={{ background: '#1a3a6e', color: '#888', border: '1px solid #2a4a8e', cursor: 'not-allowed' }} title="Requires server">Export STEP</button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Units toggle */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">Units:</span>
        <button onClick={() => setUnits('metric')} className="px-2 py-1 rounded text-xs"
          style={{ background: units === 'metric' ? '#e94560' : '#1a3a6e', color: '#fff', border: 'none', cursor: 'pointer' }}>mm</button>
        <button onClick={() => setUnits('imperial')} className="px-2 py-1 rounded text-xs"
          style={{ background: units === 'imperial' ? '#e94560' : '#1a3a6e', color: '#fff', border: 'none', cursor: 'pointer' }}>inch</button>
      </div>
    </div>
  )
}

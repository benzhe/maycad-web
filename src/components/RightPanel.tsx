import { useCADStore } from '../store/cadStore'
import PropertiesPanel from './PropertiesPanel'
import BOMPanel from './BOMPanel'
import CutListPanel from './CutListPanel'

export default function RightPanel() {
  const { activePanel, setActivePanel } = useCADStore()

  return (
    <div className="flex flex-col" style={{ width: 240, background: '#16213e', borderLeft: '1px solid #1a3a6e' }}>
      {/* Tab bar */}
      <div className="flex" style={{ borderBottom: '1px solid #1a3a6e' }}>
        {(['properties', 'bom', 'cutlist'] as const).map(panel => (
          <button key={panel} onClick={() => setActivePanel(panel)}
            className="flex-1 py-1 text-xs capitalize"
            style={{
              background: activePanel === panel ? '#1a3a6e' : '#0f3460',
              color: activePanel === panel ? '#fff' : '#888',
              border: 'none',
              borderBottom: activePanel === panel ? '2px solid #e94560' : '2px solid transparent',
              cursor: 'pointer',
            }}>
            {panel === 'bom' ? 'BOM' : panel === 'cutlist' ? 'Cut List' : 'Properties'}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'properties' && <PropertiesPanel />}
        {activePanel === 'bom' && <BOMPanel />}
        {activePanel === 'cutlist' && <CutListPanel />}
      </div>
    </div>
  )
}

import { useCADStore } from '../store/cadStore'
import { mmToDisplay } from '../utils/units'

export default function CutListPanel() {
  const { profiles, units } = useCADStore()

  // Group by profile type
  const groups = new Map<string, number[]>()
  for (const p of profiles) {
    if (!groups.has(p.name)) groups.set(p.name, [])
    groups.get(p.name)!.push(p.length)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 text-xs text-gray-400 border-b border-blue-900">Cut List</div>
      <div className="flex-1 overflow-y-auto">
        {Array.from(groups.entries()).map(([name, lengths]) => {
          const sorted = [...lengths].sort((a, b) => a - b)
          const total = sorted.reduce((s, l) => s + l, 0)
          return (
            <div key={name} className="p-2 border-b border-blue-900">
              <div className="text-xs font-semibold text-gray-300 mb-1">{name} <span className="text-gray-500">×{sorted.length}</span></div>
              <div className="flex flex-wrap gap-1">
                {sorted.map((l, i) => (
                  <span key={i} className="text-xs px-1 rounded" style={{ background: '#0f3460', color: '#ccc' }}>
                    {mmToDisplay(l, units)}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total: {mmToDisplay(total, units)}</div>
            </div>
          )
        })}
        {groups.size === 0 && <div className="p-3 text-xs text-gray-600">No profiles in scene</div>}
      </div>
    </div>
  )
}

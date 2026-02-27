import { useCADStore } from '../store/cadStore'
import { generateBOM, exportBOMasCSV } from '../utils/bom'
import { mmToDisplay } from '../utils/units'

export default function BOMPanel() {
  const { profiles, connectors, units, updateProfile, updateConnector } = useCADStore()
  const bom = generateBOM(profiles, connectors)
  const totalWeight = bom.filter(i => !i.excluded).reduce((sum, i) => sum + i.totalWeight, 0)

  function handleExport() {
    const csv = exportBOMasCSV(bom)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bom.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-2 text-xs" style={{ borderBottom: '1px solid #1a3a6e' }}>
        <span className="text-gray-400">Total Weight: <span className="text-gray-200">{totalWeight.toFixed(2)} kg</span></span>
        <button onClick={handleExport} className="px-2 py-0.5 rounded text-xs"
          style={{ background: '#0f3460', color: '#ccc', border: '1px solid #1a3a6e', cursor: 'pointer' }}>
          Export CSV
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f3460', position: 'sticky', top: 0 }}>
              <th className="p-1 text-left text-gray-400">#</th>
              <th className="p-1 text-left text-gray-400">Article</th>
              <th className="p-1 text-left text-gray-400">Description</th>
              <th className="p-1 text-right text-gray-400">Qty</th>
              <th className="p-1 text-right text-gray-400">Length</th>
              <th className="p-1 text-right text-gray-400">Weight</th>
              <th className="p-1 text-center text-gray-400">Excl</th>
            </tr>
          </thead>
          <tbody>
            {bom.map(item => (
              <tr key={item.position} style={{
                borderBottom: '1px solid #1a2a4e',
                opacity: item.excluded ? 0.4 : 1,
              }}>
                <td className="p-1 text-gray-500">{item.position}</td>
                <td className="p-1 text-gray-300">{item.articleNumber}</td>
                <td className="p-1 text-gray-300">{item.description}</td>
                <td className="p-1 text-right text-gray-300">{item.quantity}</td>
                <td className="p-1 text-right text-gray-400">
                  {item.length ? mmToDisplay(item.length, units) : '—'}
                </td>
                <td className="p-1 text-right text-gray-400">{item.totalWeight.toFixed(2)} kg</td>
                <td className="p-1 text-center">
                  <input
                    type="checkbox"
                    checked={item.excluded}
                    onChange={(e) => {
                      item.instanceIds.forEach(id => {
                        const p = profiles.find(p => p.instanceId === id)
                        if (p) updateProfile(id, { excluded: e.target.checked })
                        const c = connectors.find(c => c.instanceId === id)
                        if (c) updateConnector(id, { excluded: e.target.checked })
                      })
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

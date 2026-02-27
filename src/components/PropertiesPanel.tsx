import { useCADStore } from '../store/cadStore'
import { profileLibrary } from '../data/profiles'
import { mmToUnit, displayToMm } from '../utils/units'

export default function PropertiesPanel() {
  const { profiles, selectedIds, updateProfile, removeProfile, units } = useCADStore()

  if (selectedIds.length === 0) {
    return (
      <div className="p-3 text-sm text-gray-500">
        Select a profile to view properties
      </div>
    )
  }

  if (selectedIds.length > 1) {
    return (
      <div className="p-3 text-sm text-gray-400">
        {selectedIds.length} items selected
        <button
          onClick={() => selectedIds.forEach(id => removeProfile(id))}
          className="mt-2 w-full py-1 rounded text-xs"
          style={{ background: '#3a1010', color: '#f88', border: '1px solid #5a2020', cursor: 'pointer' }}
        >
          Delete Selected
        </button>
      </div>
    )
  }

  const profile = profiles.find(p => p.instanceId === selectedIds[0])
  if (!profile) return null

  const lengthInUnits = mmToUnit(profile.length, units)

  return (
    <div className="p-2 overflow-y-auto">
      <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Profile Properties</div>

      {/* Profile type */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Type</label>
        <select
          value={profile.id}
          onChange={e => {
            const pt = profileLibrary.find(p => p.id === e.target.value)
            if (pt) updateProfile(profile.instanceId, {
              id: pt.id,
              name: pt.name,
              width: pt.width,
              height: pt.height,
              articleNumber: pt.articleNumber,
              weightPerMeter: pt.weightPerMeter,
              slots: pt.slots,
            })
          }}
          className="w-full px-2 py-1 rounded text-xs"
          style={{ background: '#0f3460', border: '1px solid #1a3a6e', color: '#e0e0e0', outline: 'none' }}
        >
          {profileLibrary.map(p => (
            <option key={p.id} value={p.id}>{p.name} - {p.articleNumber}</option>
          ))}
        </select>
      </div>

      {/* Article number */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Article No.</label>
        <input
          value={profile.articleNumber}
          onChange={e => updateProfile(profile.instanceId, { articleNumber: e.target.value })}
          className="w-full px-2 py-1 rounded text-xs"
          style={{ background: '#0f3460', border: '1px solid #1a3a6e', color: '#e0e0e0', outline: 'none' }}
        />
      </div>

      {/* Length */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Length ({units === 'metric' ? 'mm' : 'in'})</label>
        <input
          type="number"
          value={lengthInUnits.toFixed(units === 'metric' ? 1 : 3)}
          onChange={e => updateProfile(profile.instanceId, { length: displayToMm(parseFloat(e.target.value) || 0, units) })}
          className="w-full px-2 py-1 rounded text-xs"
          style={{ background: '#0f3460', border: '1px solid #1a3a6e', color: '#e0e0e0', outline: 'none' }}
        />
      </div>

      {/* Rotation */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Rotation (Y)</label>
        <div className="flex gap-1">
          {[0, 90, 180, 270].map(r => (
            <button key={r} onClick={() => updateProfile(profile.instanceId, { rotation: r })}
              className="flex-1 py-1 rounded text-xs"
              style={{ background: profile.rotation === r ? '#e94560' : '#0f3460', color: '#fff', border: '1px solid #1a3a6e', cursor: 'pointer' }}>
              {r}°
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Position</label>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} className="flex items-center gap-1 mb-1">
            <span className="text-xs w-4 text-gray-400">{axis}</span>
            <input
              type="number"
              value={mmToUnit(profile.position[i], units).toFixed(units === 'metric' ? 1 : 3)}
              onChange={e => {
                const newPos: [number, number, number] = [...profile.position] as [number, number, number]
                newPos[i] = displayToMm(parseFloat(e.target.value) || 0, units)
                updateProfile(profile.instanceId, { position: newPos })
              }}
              className="flex-1 px-2 py-1 rounded text-xs"
              style={{ background: '#0f3460', border: '1px solid #1a3a6e', color: '#e0e0e0', outline: 'none' }}
            />
          </div>
        ))}
      </div>

      {/* Dimensions read-only */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Cross Section</label>
        <div className="text-xs text-gray-400">{profile.width}mm × {profile.height}mm</div>
        <div className="text-xs text-gray-400">{profile.slots} slots</div>
      </div>

      {/* Weight */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Weight</label>
        <div className="text-xs text-gray-400">{(profile.weightPerMeter * profile.length / 1000).toFixed(3)} kg</div>
      </div>

      {/* Color */}
      <div className="mb-2">
        <label className="text-xs text-gray-500 block mb-1">Color</label>
        <input
          type="color"
          value={profile.color}
          onChange={e => updateProfile(profile.instanceId, { color: e.target.value })}
          className="w-full h-6 rounded cursor-pointer"
          style={{ background: 'none', border: '1px solid #1a3a6e' }}
        />
      </div>

      {/* Exclude from BOM */}
      <div className="mb-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={profile.excluded}
          onChange={e => updateProfile(profile.instanceId, { excluded: e.target.checked })}
          id="exclude-check"
        />
        <label htmlFor="exclude-check" className="text-xs text-gray-400 cursor-pointer">Exclude from BOM</label>
      </div>

      {/* Delete */}
      <button
        onClick={() => removeProfile(profile.instanceId)}
        className="w-full py-1 rounded text-xs mt-2"
        style={{ background: '#3a1010', color: '#f88', border: '1px solid #5a2020', cursor: 'pointer' }}
      >
        Delete Profile
      </button>
    </div>
  )
}

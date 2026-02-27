import { useState } from 'react'
import { useCADStore } from '../store/cadStore'
import { profileLibrary, profileCategories } from '../data/profiles'
import type { ProfileType } from '../types'

export default function ProfileLibrary() {
  const { activeProfileType, setActiveProfileType, setActiveTool } = useCADStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = profileLibrary.filter(p =>
    (category === 'All' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.articleNumber.toLowerCase().includes(search.toLowerCase()))
  )

  function handleSelect(p: ProfileType) {
    setActiveProfileType(p.id)
    setActiveTool('profile')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#16213e', width: 200, borderRight: '1px solid #1a3a6e' }}>
      <div className="p-2 font-semibold text-sm" style={{ background: '#0f3460', borderBottom: '1px solid #1a3a6e', color: '#e0e0e0' }}>
        Profile Library
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-2 py-1 rounded text-sm"
          style={{ background: '#0f3460', border: '1px solid #1a3a6e', color: '#e0e0e0', outline: 'none' }}
        />
      </div>

      {/* Category filter */}
      <div className="px-2 pb-2 flex flex-wrap gap-1">
        {profileCategories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="px-1 py-0.5 rounded text-xs"
            style={{ background: category === cat ? '#e94560' : '#0f3460', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Profile list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => handleSelect(p)}
            className="px-2 py-2 cursor-pointer flex items-center gap-2"
            style={{
              background: activeProfileType === p.id ? '#1a3a6e' : 'transparent',
              borderBottom: '1px solid #1a2a4e',
              borderLeft: activeProfileType === p.id ? '3px solid #e94560' : '3px solid transparent',
            }}
          >
            {/* Profile cross-section preview */}
            <div className="flex-shrink-0" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: Math.max(8, Math.min(24, p.width / 5)),
                height: Math.max(8, Math.min(24, p.height / 5)),
                background: '#a0a0b0',
                border: '1px solid #808090',
              }} />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-200">{p.name}</div>
              <div className="text-xs text-gray-500">{p.articleNumber}</div>
              <div className="text-xs text-gray-600">{p.weightPerMeter} kg/m</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

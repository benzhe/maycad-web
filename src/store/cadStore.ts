import { create } from 'zustand'
import type { Profile, ConnectorInstance, ConnectorSuggestion, Tool, Units } from '../types'

interface CADState {
  profiles: Profile[]
  connectors: ConnectorInstance[]
  selectedIds: string[]
  activeTool: Tool
  units: Units
  activeProfileType: string | null
  placingProfile: boolean
  connectorSuggestion: ConnectorSuggestion | null
  activePanel: 'properties' | 'bom' | 'cutlist'

  // Actions
  addProfile: (profile: Profile) => void
  removeProfile: (instanceId: string) => void
  updateProfile: (instanceId: string, updates: Partial<Profile>) => void
  selectProfile: (instanceId: string, multiSelect?: boolean) => void
  deselectAll: () => void
  setActiveTool: (tool: Tool) => void
  setUnits: (units: Units) => void
  setActiveProfileType: (id: string | null) => void
  setPlacingProfile: (placing: boolean) => void
  addConnector: (connector: ConnectorInstance) => void
  removeConnector: (instanceId: string) => void
  updateConnector: (instanceId: string, updates: Partial<ConnectorInstance>) => void
  setConnectorSuggestion: (suggestion: ConnectorSuggestion | null) => void
  setActivePanel: (panel: 'properties' | 'bom' | 'cutlist') => void
  loadScene: (profiles: Profile[], connectors: ConnectorInstance[], units: Units) => void
  clearScene: () => void
}

export const useCADStore = create<CADState>((set) => ({
  profiles: [],
  connectors: [],
  selectedIds: [],
  activeTool: 'select',
  units: 'metric',
  activeProfileType: null,
  placingProfile: false,
  connectorSuggestion: null,
  activePanel: 'properties',

  addProfile: (profile) => set((s) => ({ profiles: [...s.profiles, profile] })),
  removeProfile: (instanceId) => set((s) => ({
    profiles: s.profiles.filter(p => p.instanceId !== instanceId),
    selectedIds: s.selectedIds.filter(id => id !== instanceId),
  })),
  updateProfile: (instanceId, updates) => set((s) => ({
    profiles: s.profiles.map(p => p.instanceId === instanceId ? { ...p, ...updates } : p),
  })),
  selectProfile: (instanceId, multiSelect = false) => set((s) => {
    if (multiSelect) {
      const already = s.selectedIds.includes(instanceId)
      return { selectedIds: already ? s.selectedIds.filter(id => id !== instanceId) : [...s.selectedIds, instanceId] }
    }
    return { selectedIds: [instanceId] }
  }),
  deselectAll: () => set({ selectedIds: [] }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setUnits: (units) => set({ units }),
  setActiveProfileType: (id) => set({ activeProfileType: id }),
  setPlacingProfile: (placing) => set({ placingProfile: placing }),
  addConnector: (connector) => set((s) => ({ connectors: [...s.connectors, connector] })),
  removeConnector: (instanceId) => set((s) => ({
    connectors: s.connectors.filter(c => c.instanceId !== instanceId),
  })),
  updateConnector: (instanceId, updates) => set((s) => ({
    connectors: s.connectors.map(c => c.instanceId === instanceId ? { ...c, ...updates } : c),
  })),
  setConnectorSuggestion: (suggestion) => set({ connectorSuggestion: suggestion }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  loadScene: (profiles, connectors, units) => set({ profiles, connectors, units, selectedIds: [] }),
  clearScene: () => set({ profiles: [], connectors: [], selectedIds: [] }),
}))

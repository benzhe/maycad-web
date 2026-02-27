export interface ProfileType {
  id: string
  name: string
  width: number   // mm
  height: number  // mm
  slots: number
  weightPerMeter: number  // kg/m
  articleNumber: string
  category: string
}

export interface Profile {
  id: string
  instanceId: string
  name: string
  width: number
  height: number
  length: number
  position: [number, number, number]
  rotation: number  // degrees around Y
  articleNumber: string
  weightPerMeter: number
  slots: number
  color: string
  excluded: boolean
}

export interface ConnectorType {
  id: string
  name: string
  compatibleSlots: number[]
  weight: number
  articleNumber: string
  description: string
}

export interface ConnectorInstance {
  id: string
  instanceId: string
  connectorType: string
  position: [number, number, number]
  profileIds: [string, string]
  articleNumber: string
  weight: number
  excluded: boolean
}

export interface ConnectorSuggestion {
  profile1Id: string
  profile2Id: string
  position: [number, number, number]
  suggestedConnectors: ConnectorType[]
}

export interface Scene {
  profiles: Profile[]
  connectors: ConnectorInstance[]
  units: 'metric' | 'imperial'
  version: string
}

export type Tool = 'select' | 'move' | 'profile' | 'connector' | 'hole' | 'measure'
export type Units = 'metric' | 'imperial'

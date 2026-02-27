import type { Profile, ConnectorInstance } from '../types'

export interface BOMItem {
  position: number
  articleNumber: string
  description: string
  quantity: number
  length: number | null
  unitWeight: number
  totalWeight: number
  excluded: boolean
  instanceIds: string[]
}

export function generateBOM(profiles: Profile[], connectors: ConnectorInstance[]): BOMItem[] {
  const items: BOMItem[] = []
  let pos = 1

  // Group profiles by articleNumber + length
  const profileGroups = new Map<string, Profile[]>()
  for (const p of profiles) {
    const key = `${p.articleNumber}|${p.length}`
    if (!profileGroups.has(key)) profileGroups.set(key, [])
    profileGroups.get(key)!.push(p)
  }

  for (const [, group] of profileGroups) {
    const first = group[0]
    const lengthM = first.length / 1000
    items.push({
      position: pos++,
      articleNumber: first.articleNumber,
      description: `${first.name} L=${first.length}mm`,
      quantity: group.length,
      length: first.length,
      unitWeight: first.weightPerMeter * lengthM,
      totalWeight: first.weightPerMeter * lengthM * group.length,
      excluded: group.every(p => p.excluded),
      instanceIds: group.map(p => p.instanceId),
    })
  }

  // Group connectors by type
  const connectorGroups = new Map<string, ConnectorInstance[]>()
  for (const c of connectors) {
    if (!connectorGroups.has(c.connectorType)) connectorGroups.set(c.connectorType, [])
    connectorGroups.get(c.connectorType)!.push(c)
  }
  for (const [, group] of connectorGroups) {
    const first = group[0]
    items.push({
      position: pos++,
      articleNumber: first.articleNumber,
      description: first.connectorType,
      quantity: group.length,
      length: null,
      unitWeight: first.weight,
      totalWeight: first.weight * group.length,
      excluded: group.every(c => c.excluded),
      instanceIds: group.map(c => c.instanceId),
    })
  }

  return items
}

export function exportBOMasCSV(items: BOMItem[]): string {
  const header = 'Pos,Article Number,Description,Qty,Length (mm),Unit Weight (kg),Total Weight (kg),Excluded'
  const rows = items.map(item =>
    `${item.position},${item.articleNumber},"${item.description}",${item.quantity},${item.length ?? ''},${item.unitWeight.toFixed(3)},${item.totalWeight.toFixed(3)},${item.excluded}`
  )
  return [header, ...rows].join('\n')
}

import type { Profile } from '../types'
import { v4 as uuidv4 } from 'uuid'

export function createSimpleFrame(): Profile[] {
  const w = 40, h = 40
  return [
    // Bottom frame
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 0, 1000], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 0, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [1000, 0, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Verticals
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [1000, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 0, 1000], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [1000, 0, 1000], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Top frame
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 1000, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 1000, 1000], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [0, 1000, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: w, height: h, length: 1000, position: [1000, 1000, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
  ]
}

export function createWorkbench(): Profile[] {
  return [
    // Legs
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 900, position: [0, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 900, position: [1200, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 900, position: [0, 0, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 900, position: [1200, 0, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Long rails top
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [0, 900, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [0, 900, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Short rails top
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 600, position: [0, 900, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 600, position: [1200, 900, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Mid shelf rails
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [0, 450, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [0, 450, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
  ]
}

export function createMachineGuard(): Profile[] {
  return [
    // Base frame
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 800, position: [0, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 800, position: [0, 0, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 600, position: [0, 0, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 600, position: [800, 0, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Verticals
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [0, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [800, 0, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [0, 0, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 1200, position: [800, 0, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    // Top frame
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 800, position: [0, 1200, 0], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 800, position: [0, 1200, 600], rotation: 0, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 600, position: [0, 1200, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
    { id: 'sq4040', instanceId: uuidv4(), name: '40x40', width: 40, height: 40, length: 600, position: [800, 1200, 0], rotation: 90, articleNumber: 'PRF-4040', weightPerMeter: 1.53, slots: 4, color: '#c0c0c0', excluded: false },
  ]
}

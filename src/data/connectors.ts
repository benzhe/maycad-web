import type { ConnectorType } from '../types'

export const connectorLibrary: ConnectorType[] = [
  { id: 'bracket-l', name: 'Right Angle Bracket', compatibleSlots: [4, 6, 8], weight: 0.05, articleNumber: 'CON-LAB', description: 'L-shaped bracket for 90° connections' },
  { id: 'bracket-t', name: 'T-Connector', compatibleSlots: [4, 6, 8], weight: 0.08, articleNumber: 'CON-TCN', description: 'T-shaped connector for three-way joints' },
  { id: 'bracket-cross', name: 'Cross Connector', compatibleSlots: [4, 6, 8], weight: 0.12, articleNumber: 'CON-CRS', description: '4-way cross connector' },
  { id: 'end-cap', name: 'End Cap', compatibleSlots: [4, 6, 8], weight: 0.01, articleNumber: 'CON-ECP', description: 'Profile end cap for finishing' },
  { id: 'foot-fixed', name: 'Fixed Foot', compatibleSlots: [4, 6, 8], weight: 0.18, articleNumber: 'CON-FFT', description: 'Fixed mounting foot M8' },
  { id: 'foot-adj', name: 'Adjustable Foot', compatibleSlots: [4, 6, 8], weight: 0.22, articleNumber: 'CON-AFT', description: 'Height-adjustable foot M10x50' },
  { id: 'caster', name: 'Caster Wheel', compatibleSlots: [4, 6, 8], weight: 0.45, articleNumber: 'CON-CST', description: '50mm swivel caster with brake' },
  { id: 'hinge', name: 'Hinge', compatibleSlots: [4, 6, 8], weight: 0.15, articleNumber: 'CON-HNG', description: 'Piano hinge for door frames' },
  { id: 'corner-l3d', name: '3D Corner Bracket', compatibleSlots: [4, 6, 8], weight: 0.09, articleNumber: 'CON-3DC', description: '3D corner bracket for cubic frames' },
  { id: 'gusset', name: 'Gusset Plate', compatibleSlots: [4, 6, 8], weight: 0.07, articleNumber: 'CON-GST', description: 'Diagonal gusset for rigidity' },
  { id: 'slide-nut', name: 'Slide-in Nut M6', compatibleSlots: [4, 6, 8], weight: 0.005, articleNumber: 'CON-SN6', description: 'M6 T-slot slide-in nut' },
  { id: 'slide-nut-8', name: 'Slide-in Nut M8', compatibleSlots: [6, 8], weight: 0.008, articleNumber: 'CON-SN8', description: 'M8 T-slot slide-in nut' },
]

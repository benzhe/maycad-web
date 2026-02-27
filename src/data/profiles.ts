import type { ProfileType } from '../types'

export const profileLibrary: ProfileType[] = [
  // Standard Square Profiles
  { id: 'sq2020', name: '20x20', width: 20, height: 20, slots: 4, weightPerMeter: 0.56, articleNumber: 'PRF-2020', category: 'Standard' },
  { id: 'sq3030', name: '30x30', width: 30, height: 30, slots: 4, weightPerMeter: 1.08, articleNumber: 'PRF-3030', category: 'Standard' },
  { id: 'sq4040', name: '40x40', width: 40, height: 40, slots: 4, weightPerMeter: 1.53, articleNumber: 'PRF-4040', category: 'Standard' },
  { id: 'sq4545', name: '45x45', width: 45, height: 45, slots: 4, weightPerMeter: 1.80, articleNumber: 'PRF-4545', category: 'Standard' },
  { id: 'sq6060', name: '60x60', width: 60, height: 60, slots: 4, weightPerMeter: 2.89, articleNumber: 'PRF-6060', category: 'Standard' },
  { id: 'sq8080', name: '80x80', width: 80, height: 80, slots: 4, weightPerMeter: 4.20, articleNumber: 'PRF-8080', category: 'Standard' },
  { id: 'sq100100', name: '100x100', width: 100, height: 100, slots: 4, weightPerMeter: 6.50, articleNumber: 'PRF-100100', category: 'Standard' },
  // Rectangular Profiles
  { id: 'rc2040', name: '20x40', width: 20, height: 40, slots: 4, weightPerMeter: 0.85, articleNumber: 'PRF-2040', category: 'Rectangular' },
  { id: 'rc2060', name: '20x60', width: 20, height: 60, slots: 4, weightPerMeter: 1.15, articleNumber: 'PRF-2060', category: 'Rectangular' },
  { id: 'rc4080', name: '40x80', width: 40, height: 80, slots: 6, weightPerMeter: 2.25, articleNumber: 'PRF-4080', category: 'Rectangular' },
  { id: 'rc40120', name: '40x120', width: 40, height: 120, slots: 6, weightPerMeter: 3.10, articleNumber: 'PRF-40120', category: 'Rectangular' },
  { id: 'rc60120', name: '60x120', width: 60, height: 120, slots: 8, weightPerMeter: 4.50, articleNumber: 'PRF-60120', category: 'Rectangular' },
  { id: 'rc80160', name: '80x160', width: 80, height: 160, slots: 8, weightPerMeter: 6.80, articleNumber: 'PRF-80160', category: 'Rectangular' },
  { id: 'rc20x80', name: '20x80', width: 20, height: 80, slots: 4, weightPerMeter: 1.45, articleNumber: 'PRF-2080', category: 'Rectangular' },
  { id: 'rc30x60', name: '30x60', width: 30, height: 60, slots: 4, weightPerMeter: 1.60, articleNumber: 'PRF-3060', category: 'Rectangular' },
  // Heavy Duty
  { id: 'hd4040', name: '40x40 HD', width: 40, height: 40, slots: 4, weightPerMeter: 2.20, articleNumber: 'PRF-4040HD', category: 'Heavy Duty' },
  { id: 'hd6060', name: '60x60 HD', width: 60, height: 60, slots: 4, weightPerMeter: 3.80, articleNumber: 'PRF-6060HD', category: 'Heavy Duty' },
  { id: 'hd8080', name: '80x80 HD', width: 80, height: 80, slots: 4, weightPerMeter: 6.20, articleNumber: 'PRF-8080HD', category: 'Heavy Duty' },
  { id: 'hd60120', name: '60x120 HD', width: 60, height: 120, slots: 8, weightPerMeter: 7.50, articleNumber: 'PRF-60120HD', category: 'Heavy Duty' },
  { id: 'hd80160', name: '80x160 HD', width: 80, height: 160, slots: 8, weightPerMeter: 9.80, articleNumber: 'PRF-80160HD', category: 'Heavy Duty' },
]

export const profileCategories = ['All', 'Standard', 'Rectangular', 'Heavy Duty']

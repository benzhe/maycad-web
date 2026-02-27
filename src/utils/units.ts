export function mmToDisplay(mm: number, units: 'metric' | 'imperial'): string {
  if (units === 'imperial') {
    const inches = mm / 25.4
    return `${inches.toFixed(3)}"`
  }
  return `${mm.toFixed(1)} mm`
}

export function displayToMm(value: number, units: 'metric' | 'imperial'): number {
  if (units === 'imperial') return value * 25.4
  return value
}

export function mmToUnit(mm: number, units: 'metric' | 'imperial'): number {
  if (units === 'imperial') return mm / 25.4
  return mm
}

export type Grade = 'PID-1' | 'PID-2' | 'PID-3' | 'PID-4' | 'PID-R (Residual)'

export interface ScanResult {
  grade: string
  score: string
  cleanliness: string
  texture: string
}

export interface BatchCounters {
  pid1: number
  pid2: number
  pid3: number
  residual: number
}

export interface SensorPhase {
  id: number
  label: string
}

export const CONVEYOR_PHASES: SensorPhase[] = [
  { id: 1, label: 'Phase 1: Fiber Detected at Entrance Ultrasonic' },
  { id: 2, label: 'Phase 2: Traveling to Core Scan Checkpoint' },
  { id: 3, label: 'Phase 3: Awaiting Structural Frame Alignment' },
  { id: 4, label: 'Phase 4: Sensor Optics Aligning (Motor Stopped)' },
  { id: 5, label: 'Phase 5: Running Fiber Metrics Scan (TCS3200 & 3-IR)' },
  { id: 6, label: 'Phase 6: PNS/BAFS 318:2021 Grading & Cloud Sync' },
]

export const HANDHELD_PHASES: SensorPhase[] = [
  { id: 1, label: 'Phase 1: Positioned under TCS3200 / IR' },
  { id: 2, label: 'Phase 2: Calibrating RGB & Analog IR' },
  { id: 3, label: 'Phase 3: Reading Color & Texture' },
  { id: 4, label: 'Phase 4: Evaluating PNS 318:2021' },
  { id: 5, label: 'Phase 5: Scan Completed & Logged' },
]

export const EMPTY_SCAN: ScanResult = {
  grade: '----',
  score: '----',
  cleanliness: '----',
  texture: '----',
}

export const EMPTY_COUNTERS: BatchCounters = {
  pid1: 0,
  pid2: 0,
  pid3: 0,
  residual: 0,
}

export const DEFAULT_WS_URL = 'ws://192.168.4.1/ws'

/**
 * Parse a raw pipe-delimited WebSocket message.
 * Example: DATA|Score:88.54%|Grade:PID-1|Clean:FAIR|Texture:SOFT
 * Returns null when the message is not a valid DATA frame.
 */
export function parseDataMessage(raw: string): ScanResult | null {
  const parts = raw.trim().split('|')
  if (parts.length === 0 || parts[0].toUpperCase() !== 'DATA') return null

  const map: Record<string, string> = {}
  for (const segment of parts.slice(1)) {
    const idx = segment.indexOf(':')
    if (idx === -1) continue
    const key = segment.slice(0, idx).trim().toLowerCase()
    const value = segment.slice(idx + 1).trim()
    map[key] = value
  }

  const grade = map['grade']
  if (!grade) return null

  return {
    grade: grade.toUpperCase(),
    score: map['score'] ?? '100.0%',
    cleanliness: (map['clean'] ?? map['cleanliness'] ?? 'EXCELLENT').toUpperCase(),
    texture: (map['texture'] ?? 'SOFT').toUpperCase(),
  }
}

export function counterKeyForGrade(grade: string): keyof BatchCounters {
  const normalized = grade.replace(/[\s-]/g, '').toUpperCase()
  if (normalized.includes('PID1')) return 'pid1'
  if (normalized.includes('PID2')) return 'pid2'
  if (normalized.includes('PID3')) return 'pid3'
  return 'residual'
}

export function totalProcessed(c: BatchCounters): number {
  return c.pid1 + c.pid2 + c.pid3 + c.residual
}

/** Map a raw cleanliness reading to its PNS-standard descriptor. */
export function formatCleanliness(raw: string): string {
  const key = raw.replace(/\s.*$/, '').toUpperCase()
  const map: Record<string, string> = {
    EXCELLENT: 'Excellent (PNS Standard)',
    CLEAN: 'Excellent (PNS Standard)',
    GOOD: 'Good (PNS Standard)',
    FAIR: 'Fair (PNS Standard)',
    POOR: 'Poor (PNS Standard)',
    'SOILED/STAINED/MOLDY': 'Soiled / Stained / Moldy',
  }
  return map[key] ?? raw
}

/** Map a raw surface-texture reading to its fiber descriptor. */
export function formatTexture(raw: string): string {
  const key = raw.replace(/\s.*$/, '').toUpperCase()
  const map: Record<string, string> = {
    SOFT: 'Soft (Brushed)',
    MEDIUM: 'Medium-coarse (Unbrushed)',
    COARSE: 'Medium-coarse (Unbrushed)',
    IRREGULAR: 'Irregular',
  }
  return map[key] ?? raw
}

/** A locally-generated scan matching PNS/BAFS 318:2021 standards. */
export function simulateScan(): ScanResult {
  const samples: ScanResult[] = [
    { grade: 'PID-1', score: '100.0%', cleanliness: 'EXCELLENT', texture: 'SOFT' },
    { grade: 'PID-1', score: '100.0%', cleanliness: 'EXCELLENT', texture: 'SOFT' },
    { grade: 'PID-2', score: '76.7%', cleanliness: 'GOOD', texture: 'MEDIUM' },
    { grade: 'PID-3', score: '29.0%', cleanliness: 'FAIR', texture: 'COARSE' },
    { grade: 'PID-4', score: '22.7%', cleanliness: 'FAIR', texture: 'COARSE' },
    { grade: 'PID-R (Residual)', score: '0.0%', cleanliness: 'SOILED/STAINED/MOLDY', texture: 'IRREGULAR' },
  ]
  return samples[Math.floor(Math.random() * samples.length)]
}

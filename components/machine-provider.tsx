'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  DEFAULT_WS_URL,
  EMPTY_COUNTERS,
  EMPTY_SCAN,
  type BatchCounters,
  type ScanResult,
  type SensorCheckResult,
  counterKeyForGrade,
  parseDataMessage,
  parseSensorCheckMessage,
  parseScannerStateMessage,
  simulateScan,
} from '@/lib/machine'
import { addScan, countUnsynced, markAllSynced } from '@/lib/idb'

export type Mode = 'conveyor' | 'handheld'
export type ConnectionStatus = 'connecting' | 'connected' | 'offline'
export type ConveyorState = 'idle' | 'running' | 'paused'
export type ScannerState = 'idle' | 'scanning' | 'paused'

interface MachineContextValue {
  mode: Mode | null
  setMode: (mode: Mode | null) => void
  scan: ScanResult
  counters: BatchCounters
  connection: ConnectionStatus
  conveyor: ConveyorState
  activePhase: number
  handheldPhase: number
  isScanningHandheld: boolean
  pendingSync: number
  lastSyncCount: number | null
  wsIp: string
  setWsIp: (ip: string) => void
  sensorCheck: SensorCheckResult | null
  scannerState: ScannerState
  toggleScannerPause: () => void
  sendCommand: (command: string) => void
  triggerScan: () => void
  startConveyor: () => void
  pauseConveyor: () => void
  stopConveyor: () => void
  sync: () => Promise<void>
  resetBatch: () => void
  reconnect: () => void
}

const MachineContext = createContext<MachineContextValue | null>(null)

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [scan, setScan] = useState<ScanResult>(EMPTY_SCAN)
  const [counters, setCounters] = useState<BatchCounters>(EMPTY_COUNTERS)
  const [connection, setConnection] = useState<ConnectionStatus>('connecting')
  const [conveyor, setConveyor] = useState<ConveyorState>('idle')
  const [activePhase, setActivePhase] = useState<number>(4)
  const [handheldPhase, setHandheldPhase] = useState<number>(0)
  const [isScanningHandheld, setIsScanningHandheld] = useState<boolean>(false)
  const [pendingSync, setPendingSync] = useState(0)
  const [lastSyncCount, setLastSyncCount] = useState<number | null>(null)
  const [wsIp, setWsIpState] = useState<string>('192.168.4.1')
  const [retryTrigger, setRetryTrigger] = useState(0)
  const [sensorCheck, setSensorCheck] = useState<SensorCheckResult | null>(null)
  const [scannerState, setScannerState] = useState<ScannerState>('idle')

  const wsRef = useRef<WebSocket | null>(null)
  const modeRef = useRef<Mode | null>(null)
  modeRef.current = mode

  const setWsIp = useCallback((ip: string) => {
    const cleanIp = ip.trim().replace(/^https?:\/\//, '').replace(/^ws:\/\//, '').replace(/\/.*$/, '')
    if (cleanIp) {
      setWsIpState(cleanIp)
      wsRef.current?.close()
      setConnection('connecting')
      setRetryTrigger((prev) => prev + 1)
    }
  }, [])

  const reconnect = useCallback(() => {
    wsRef.current?.close()
    setConnection('connecting')
    setRetryTrigger((prev) => prev + 1)
  }, [])

  const sendCommand = useCallback((command: string) => {
    const socket = wsRef.current
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(command)
    }
  }, [])

  const toggleScannerPause = useCallback(() => {
    if (scannerState === 'scanning') {
      sendCommand('PAUSE_SCANNER')
      setScannerState('paused')
    } else if (scannerState === 'paused') {
      sendCommand('RESUME_SCANNER')
      setScannerState('scanning')
    }
  }, [scannerState, sendCommand])

  const applyScan = useCallback((result: ScanResult) => {
    setScan(result)
    setCounters((prev) => {
      const key = counterKeyForGrade(result.grade)
      return { ...prev, [key]: prev[key] + 1 }
    })
    void addScan({
      ...result,
      mode: modeRef.current ?? 'unknown',
      synced: false,
      createdAt: Date.now(),
    })
    void countUnsynced().then(setPendingSync)
  }, [])

  // Establish the WebSocket connection to the ESP32 with auto-reconnect.
  useEffect(() => {
    let cancelled = false
    let socket: WebSocket | null = null

    const targetUrl = wsIp ? `ws://${wsIp}/ws` : DEFAULT_WS_URL

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return
      setConnection('connecting')
      try {
        socket = new WebSocket(targetUrl)
        wsRef.current = socket
        socket.onopen = () => {
          if (!cancelled) {
            setConnection('connected')
            // Request diagnostic sensor check from ESP32 on connect
            socket?.send('CHECK_SENSORS')
          }
        }
        socket.onclose = () => !cancelled && setConnection('offline')
        socket.onerror = () => !cancelled && setConnection('offline')
        socket.onmessage = (event) => {
          const raw = String(event.data)

          // Check if it's a real sensor check from ESP32
          const check = parseSensorCheckMessage(raw)
          if (check) {
            setSensorCheck(check)
            return
          }

          // Check if it's a scanner state update
          const state = parseScannerStateMessage(raw)
          if (state) {
            setScannerState(state)
            return
          }

          const result = parseDataMessage(raw)
          if (!result) return

          // In handheld mode, animate through phases before showing result
          if (modeRef.current === 'handheld') {
            setIsScanningHandheld(true)
            setHandheldPhase(1)
            setScannerState('scanning')
            let step = 1
            const phaseInterval = setInterval(() => {
              step += 1
              setHandheldPhase(step)
              if (step >= 5) {
                clearInterval(phaseInterval)
                applyScan(result)
                setIsScanningHandheld(false)
                setScannerState('idle')
              }
            }, 350)
          } else {
            applyScan(result)
          }
        }
      } catch {
        setConnection('offline')
      }
    }

    connect()

    const timeout = setTimeout(() => {
      if (!cancelled && socket && socket.readyState !== WebSocket.OPEN) {
        setConnection('offline')
      }
    }, 2500)

    const retryInterval = setInterval(() => {
      if (!cancelled && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
        connect()
      }
    }, 5000)

    void countUnsynced().then(setPendingSync)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      clearInterval(retryInterval)
      socket?.close()
    }
  }, [applyScan, retryTrigger, wsIp])

  const triggerScan = useCallback(() => {
    sendCommand('TRIGGER_SCAN')
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    if (isScanningHandheld) return
    setIsScanningHandheld(true)
    setHandheldPhase(1)
    setScannerState('scanning')

    let current = 1
    const interval = setInterval(() => {
      current += 1
      setHandheldPhase(current)
      if (current >= 5) {
        clearInterval(interval)
        applyScan(simulateScan())
        setIsScanningHandheld(false)
        setScannerState('idle')
      }
    }, 450)
  }, [sendCommand, applyScan, isScanningHandheld])

  const startConveyor = useCallback(() => {
    sendCommand('START_CONVEYOR')
    setConveyor('running')
    setActivePhase(1)
  }, [sendCommand])

  const pauseConveyor = useCallback(() => {
    sendCommand('PAUSE_CONVEYOR')
    setConveyor('paused')
  }, [sendCommand])

  const stopConveyor = useCallback(() => {
    sendCommand('STOP_CONVEYOR')
    setConveyor('idle')
  }, [sendCommand])

  // Step through the 6 live ESP32 hardware sorting phases while conveyor is running
  useEffect(() => {
    if (conveyor !== 'running') return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const interval = setInterval(() => {
      setActivePhase((prev) => {
        if (prev >= 6) {
          applyScan(simulateScan())
          return 1
        }
        return prev + 1
      })
    }, 700)

    return () => clearInterval(interval)
  }, [conveyor, applyScan])

  const sync = useCallback(async () => {
    // Mark local scans as synced (ESP32 handles Supabase upload directly)
    const count = await markAllSynced()
    setLastSyncCount(count)
    void countUnsynced().then(setPendingSync)
  }, [])

  const resetBatch = useCallback(() => {
    setCounters(EMPTY_COUNTERS)
    setScan(EMPTY_SCAN)
    setConveyor('idle')
    setActivePhase(4)
    setHandheldPhase(0)
    setIsScanningHandheld(false)
    setScannerState('idle')
    setLastSyncCount(null)
  }, [])

  return (
    <MachineContext.Provider
      value={{
        mode,
        setMode,
        scan,
        counters,
        connection,
        conveyor,
        activePhase,
        handheldPhase,
        isScanningHandheld,
        pendingSync,
        lastSyncCount,
        wsIp,
        setWsIp,
        sensorCheck,
        scannerState,
        toggleScannerPause,
        sendCommand,
        triggerScan,
        startConveyor,
        pauseConveyor,
        stopConveyor,
        sync,
        resetBatch,
        reconnect,
      }}
    >
      {children}
    </MachineContext.Provider>
  )
}

export function useMachine() {
  const ctx = useContext(MachineContext)
  if (!ctx) throw new Error('useMachine must be used within MachineProvider')
  return ctx
}

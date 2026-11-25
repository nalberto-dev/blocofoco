import { useEffect, useRef, useState } from 'react'
import { Check, Minus, Pause, Play, Plus, X } from 'lucide-react'
import Checklist from './Checklist'
import ProgressBar from './ProgressBar'
import type { BlocksApi } from '../hooks/useBlocks'
import { CATEGORY_STYLE, type Block } from '../types'

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

interface Props {
  block: Block
  api: BlocksApi
  onClose: () => void
}

export default function FocusMode({ block, api, onClose }: Props) {
  const initial = block.estimated_minutes * 60_000
  const [totalMs, setTotalMs] = useState(initial) // duração total (muda com os ajustes)
  const [endAt, setEndAt] = useState<number | null>(() => Date.now() + initial) // timestamp do fim; null = pausado/finalizado
  const [pausedMs, setPausedMs] = useState(initial) // tempo restante enquanto pausado
  const [now, setNow] = useState(() => Date.now())
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AC) audioRef.current = new AC()
    } catch {
      /* sem áudio: segue só com vibração */
    }
    return () => {
      void audioRef.current?.close()
    }
  }, [])

  function beep() {
    const ctx = audioRef.current
    if (!ctx) return
    void ctx.resume()
    ;[0, 0.25, 0.5].forEach((delay) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime + delay
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
      osc.start(t)
      osc.stop(t + 0.2)
    })
  }

  // Tempo calculado por Date.now(): continua correto com a aba em segundo plano
  useEffect(() => {
    if (endAt === null) return
    const tick = () => {
      const n = Date.now()
      setNow(n)
      if (n >= endAt) {
        setEndAt(null)
        setPausedMs(0)
        setDone(true)
        beep()
        navigator.vibrate?.([300, 150, 300, 150, 300])
      }
    }
    tick()
    const id = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [endAt])

  const running = endAt !== null
  const remaining = endAt !== null ? Math.max(0, endAt - now) : pausedMs
  const elapsedMs = Math.max(0, totalMs - remaining)
  const elapsedMin = Math.round(elapsedMs / 60_000)
  const pct = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0

  function pause() {
    if (endAt === null) return
    setPausedMs(Math.max(0, endAt - Date.now()))
    setEndAt(null)
  }

  function resume() {
    if (pausedMs <= 0) return
    void audioRef.current?.resume()
    setNow(Date.now())
    setEndAt(Date.now() + pausedMs)
  }

  function adjust(minutes: number) {
    const d = minutes * 60_000
    if (remaining + d <= 0) return
    setTotalMs((t) => t + d)
    if (endAt !== null) {
      setEndAt(endAt + d)
    } else if (done) {
      setDone(false)
      setNow(Date.now())
      setEndAt(Date.now() + d)
    } else {
      setPausedMs(pausedMs + d)
    }
  }

  async function finish() {
    setBusy(true)
    const ok = await api.saveFocus(block.id, elapsedMin, true)
    setBusy(false)
    if (ok) onClose()
  }

  async function exit() {
    if (elapsedMin > 0) {
      if (!confirm(`Sair sem concluir? Os ${elapsedMin} min focados serão salvos no bloco.`)) return
      await api.saveFocus(block.id, elapsedMin, false)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[block.category]}`}>
            {block.category}
          </span>
          <button className="btn-ghost !px-3" aria-label="Sair do modo foco" onClick={() => void exit()}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <h2 className="break-words text-xl font-semibold">{block.title}</h2>
          <p
            role="timer"
            className={`mt-4 font-mono text-7xl font-bold tabular-nums ${done ? 'text-emerald-400' : ''}`}
          >
            {fmt(remaining)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {done ? 'Tempo concluído! Finalize ou adicione mais tempo.' : running ? 'Focando...' : 'Pausado'}
          </p>
          <div className="mx-auto mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button className="btn-ghost" onClick={() => adjust(-5)}>
            <Minus className="h-4 w-4" /> 5 min
          </button>
          {running ? (
            <button className="btn-primary px-6" onClick={pause}>
              <Pause className="h-5 w-5" /> Pausar
            </button>
          ) : (
            <button className="btn-primary px-6" onClick={resume} disabled={done}>
              <Play className="h-5 w-5" /> Retomar
            </button>
          )}
          <button className="btn-ghost" onClick={() => adjust(5)}>
            <Plus className="h-4 w-4" /> 5 min
          </button>
        </div>

        <div className="card space-y-3">
          <ProgressBar items={block.block_checklist_items} />
          <Checklist
            items={block.block_checklist_items}
            onAdd={(l) => void api.addItem(block.id, l)}
            onToggle={(i) => void api.toggleItem(i)}
            onRemove={(i) => void api.removeItem(i)}
          />
        </div>

        <button className="btn-primary w-full" onClick={() => void finish()} disabled={busy}>
          <Check className="h-5 w-5" /> {busy ? 'Salvando...' : 'Concluir bloco'}
        </button>
      </div>
    </div>
  )
}
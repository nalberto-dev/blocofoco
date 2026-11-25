import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES, type Block, type Category, type Stage } from '../types'
import type { BlockInput } from '../hooks/useBlocks'

interface Props {
  block?: Block
  defaultStage?: Stage
  onSave: (input: BlockInput, stage: Stage) => Promise<boolean>
  onClose: () => void
}

const PRESETS = [25, 50, 90]
const on = 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
const off = 'border-slate-800 bg-slate-950 text-slate-400'

export default function BlockForm({ block, defaultStage = 'backlog', onSave, onClose }: Props) {
  const [title, setTitle] = useState(block?.title ?? '')
  const [category, setCategory] = useState<Category>(block?.category ?? 'Estudos')
  const [minutes, setMinutes] = useState(String(block?.estimated_minutes ?? 25))
  const [stage, setStage] = useState<Stage>(defaultStage)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const min = Number(minutes)
    if (!title.trim()) return setError('Dê um título ao bloco.')
    if (!Number.isInteger(min) || min <= 0 || min > 600) {
      return setError('A duração deve ser um número inteiro entre 1 e 600 minutos.')
    }
    setBusy(true)
    const ok = await onSave({ title: title.trim(), category, estimated_minutes: min }, stage)
    setBusy(false)
    if (ok) onClose()
    else setError('Não foi possível salvar. Tente novamente.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-3xl border border-slate-800 bg-slate-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{block ? 'Editar bloco' : 'Novo bloco'}</h2>
          <button type="button" className="btn-ghost !px-3" aria-label="Fechar" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block space-y-1 text-sm text-slate-400">
          Título
          <input
            className="input"
            autoFocus
            maxLength={100}
            placeholder="Ex.: Revisar capítulo 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="space-y-1 text-sm text-slate-400">
          Categoria
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`btn border ${category === c ? on : off}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 text-sm text-slate-400">
          Duração (minutos)
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setMinutes(String(p))}
                className={`btn shrink-0 border ${Number(minutes) === p ? on : off}`}
              >
                {p}
              </button>
            ))}
            <input
              className="input text-center"
              inputMode="numeric"
              aria-label="Duração em minutos"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/\D/g, '').slice(0, 3))}
            />
          </div>
        </div>

        {!block && (
          <div className="space-y-1 text-sm text-slate-400">
            Enviar para
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStage('today')} className={`btn border ${stage === 'today' ? on : off}`}>
                Hoje
              </button>
              <button type="button" onClick={() => setStage('backlog')} className={`btn border ${stage === 'backlog' ? on : off}`}>
                Backlog
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
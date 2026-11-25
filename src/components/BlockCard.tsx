import { useState, type FormEvent } from 'react'
import { Check, Clock, Pencil, Play, Plus, RotateCcw, Trash2, X, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react'
import type { BlocksApi } from '../hooks/useBlocks'
import { CATEGORY_STYLE, type Block } from '../types'

interface Props {
  block: Block
  api: BlocksApi
  onFocus?: (id: string) => void
  onEdit?: (b: Block) => void
}

export default function BlockCard({ block, api, onFocus, onEdit }: Props) {
  const [label, setLabel] = useState('')
  const items = block.block_checklist_items
  const completed = block.stage === 'completed'
  const backlog = block.stage === 'backlog'
  const done = items.filter((i) => i.is_completed).length
  const pct = items.length ? Math.round((done / items.length) * 100) : completed ? 100 : 0

  function remove() {
    if (confirm(`Excluir o bloco "${block.title}"?`)) void api.deleteBlock(block.id)
  }

  function addItem(e: FormEvent) {
    e.preventDefault()
    const v = label.trim()
    if (!v) return
    void api.addItem(block.id, v)
    setLabel('')
  }

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLE[block.category]}`}>
          {block.category}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap font-mono text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" /> {block.estimated_minutes} min
        </span>
      </div>
      {!backlog && (
        <button
          className="inline-flex min-h-[44px] items-center gap-1 px-1 text-xs font-medium text-slate-400 hover:text-slate-50"
          onClick={() => void api.moveBlock(block.id, completed ? 'today' : 'backlog')}
        >
          {completed ? (
            <><RotateCcw className="h-3.5 w-3.5" /> Reabrir</>
          ) : (
            <><ArrowLeftToLine className="h-3.5 w-3.5" /> Mover p/ Backlog</>
          )}
        </button>
      )}
    </div>
  )

  const tools = (
    <div className="flex items-center">
      {onEdit && (
        <button aria-label="Editar" onClick={() => onEdit(block)} className="inline-flex h-11 w-11 items-center justify-center text-slate-500 hover:text-slate-50">
          <Pencil className="h-4 w-4" />
        </button>
      )}
      <button aria-label="Excluir" onClick={remove} className="inline-flex h-11 w-11 items-center justify-center text-slate-500 hover:text-red-400">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )

  /* ---------- BACKLOG (compacto) ---------- */
  if (backlog) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        {header}
        <p className="break-words font-semibold">{block.title}</p>
        {items.length > 0 && (
          <p className="text-xs text-slate-500">{done}/{items.length} etapas</p>
        )}
        <div className="flex items-center gap-1">
          <button
            className="btn-ghost flex-1 !bg-slate-950/60"
            onClick={() => void api.moveBlock(block.id, 'today')}
          >
            <ArrowRightToLine className="h-4 w-4" /> Mover para Hoje
          </button>
          {tools}
        </div>
      </div>
    )
  }

  /* ---------- HOJE / CONCLUÍDO ---------- */
  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900/70 p-5 ${completed ? 'opacity-75' : ''}`}>
      {header}

      <h3 className={`mt-4 break-words text-xl font-bold ${completed ? 'text-slate-400 line-through' : ''}`}>
        {block.title}
      </h3>
      {block.focused_minutes > 0 && (
        <p className="mt-1 text-xs text-slate-500">{block.focused_minutes} min focados</p>
      )}

      <ul className="mt-3">
        {items.map((it) => (
          <li key={it.id} className="flex items-center">
            <button
              onClick={() => void api.toggleItem(it)}
              className="flex min-h-[44px] flex-1 items-center gap-3 text-left"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                  it.is_completed ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600'
                }`}
              >
                {it.is_completed && <Check className="h-4 w-4" />}
              </span>
              <span className={it.is_completed ? 'text-slate-500 line-through' : 'text-slate-200'}>{it.label}</span>
            </button>
            <button
              aria-label="Remover etapa"
              onClick={() => void api.removeItem(it)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-slate-600 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {!completed && (
        <form onSubmit={addItem} className="mt-2 flex gap-2">
          <input
            className="input !bg-slate-950/60"
            maxLength={200}
            placeholder="Nova micro-etapa..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button className="btn-ghost shrink-0 !px-3" aria-label="Adicionar etapa">
            <Plus className="h-5 w-5" />
          </button>
        </form>
      )}

      <div className="mt-4 flex items-end gap-3 border-t border-slate-800 pt-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-400">
              {items.length ? `${done}/${items.length} etapas` : 'Sem etapas'}
            </span>
            <span className="font-mono font-semibold text-emerald-400">{pct}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {!completed && onFocus && (
          <button className="btn-primary shrink-0" onClick={() => onFocus(block.id)}>
            <Play className="h-4 w-4" /> Focar
          </button>
        )}
        {tools}
      </div>
    </div>
  )
}
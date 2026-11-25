import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ChecklistItem } from '../types'

interface Props {
  items: ChecklistItem[]
  onAdd: (label: string) => void
  onToggle: (item: ChecklistItem) => void
  onRemove: (item: ChecklistItem) => void
}

export default function Checklist({ items, onAdd, onToggle, onRemove }: Props) {
  const [label, setLabel] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const v = label.trim()
    if (!v) return
    onAdd(v)
    setLabel('')
  }

  return (
    <div className="space-y-2">
      <ul>
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-1">
            <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={it.is_completed}
                onChange={() => onToggle(it)}
                className="h-5 w-5 shrink-0 accent-emerald-500"
              />
              <span className={it.is_completed ? 'text-slate-500 line-through' : ''}>{it.label}</span>
            </label>
            <button
              type="button"
              aria-label="Remover item"
              onClick={() => onRemove(it)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="flex gap-2">
        <input
          className="input"
          maxLength={200}
          placeholder="Nova micro-etapa..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button className="btn-primary shrink-0" aria-label="Adicionar item">
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
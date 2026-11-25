import type { ChecklistItem } from '../types'

export default function ProgressBar({ items }: { items: ChecklistItem[] }) {
  const total = items.length
  if (total === 0) return null
  const done = items.filter((i) => i.is_completed).length
  const pct = Math.round((done / total) * 100)

  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-400">
        {done}/{total} concluídos — {pct}%
      </p>
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
  )
}
import { useBlocks } from '../hooks/useBlocks'
import BlockCard from '../components/BlockCard'
import type { Block } from '../types'

const label = (k: string) =>
  k.length === 10
    ? new Date(`${k}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : k

export default function Done() {
  const api = useBlocks()
  const { blocks, loading, error } = api

  const done = blocks
    .filter((b) => b.stage === 'completed')
    .sort((a, b) => (b.scheduled_date ?? '').localeCompare(a.scheduled_date ?? ''))

  const groups = done.reduce<Record<string, Block[]>>((acc, b) => {
    const k = b.scheduled_date ?? 'Sem data'
    ;(acc[k] ??= []).push(b)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Concluídos</h1>

      {error && <p className="text-red-400">{error}</p>}
      {loading && <p className="text-slate-400">Carregando...</p>}
      {!loading && done.length === 0 && (
        <div className="card text-sm text-slate-400">Nenhum bloco concluído ainda.</div>
      )}

      {Object.entries(groups).map(([date, list]) => (
        <section key={date} className="space-y-3">
          <h2 className="text-sm font-medium capitalize text-slate-400">
            {label(date)} · {list.reduce((s, b) => s + b.focused_minutes, 0)} min focados
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((b) => (
              <BlockCard key={b.id} block={b} api={api} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
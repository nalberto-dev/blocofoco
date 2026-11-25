import { useState } from 'react'
import { CheckCircle2, Clock, Plus, Zap } from 'lucide-react'
import { useBlocks } from '../hooks/useBlocks'
import { todayStr } from '../lib/date'
import BlockCard from '../components/BlockCard'
import BlockForm from '../components/BlockForm'
import FocusMode from '../components/FocusMode'
import { CATEGORIES, CATEGORY_DOT, type Block, type Category, type Stage } from '../types'

type FormState = { block?: Block; stage: Stage } | null

const fmt = (m: number) => {
  const h = Math.floor(m / 60)
  const r = m % 60
  return h > 0 ? `${h}h${r ? ` ${r}m` : ''}` : `${r}m`
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function Stat({ label, icon, children, tone }: { label: string; icon: React.ReactNode; children: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="mt-2">{children}</div>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>{icon}</div>
      </div>
    </div>
  )
}

export default function Planner() {
  const api = useBlocks()
  const { blocks, loading, error } = api
  const [tab, setTab] = useState<'today' | 'backlog'>('today') // só no mobile
  const [filter, setFilter] = useState<Category | 'Todos'>('Todos')
  const [form, setForm] = useState<FormState>(null)
  const [focusId, setFocusId] = useState<string | null>(null)

  const today = todayStr()
  const match = (b: Block) => filter === 'Todos' || b.category === filter
  const allToday = blocks.filter((b) => b.stage === 'today')
  const allDone = blocks.filter((b) => b.stage === 'completed' && b.scheduled_date === today)
  const todayBlocks = allToday.filter(match)
  const doneToday = allDone.filter(match)
  const backlog = blocks.filter((b) => b.stage === 'backlog').filter(match)
  const backlogTotal = blocks.filter((b) => b.stage === 'backlog').length

  const dayBlocks = [...allToday, ...allDone]
  const dayTotal = dayBlocks.length
  const focused = dayBlocks.reduce((s, b) => s + b.focused_minutes, 0)
  const planned = dayBlocks.reduce((s, b) => s + b.estimated_minutes, 0)
  const items = dayBlocks.flatMap((b) => b.block_checklist_items)
  const pct = items.length
    ? Math.round((items.filter((i) => i.is_completed).length / items.length) * 100)
    : dayTotal
      ? Math.round((allDone.length / dayTotal) * 100)
      : 0

  const focusBlock = blocks.find((b) => b.id === focusId)
  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const chip = (active: boolean) =>
    `inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
      active ? 'border-slate-50 bg-slate-50 text-slate-950' : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
    }`

  const edit = (x: Block) => setForm({ block: x, stage: x.stage })

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold capitalize text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {dateLabel}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            {greeting()}! Pronto para focar?
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Organize suas prioridades em blocos e execute um passo de cada vez.
          </p>
        </div>
        <button
          className="btn-primary hidden shrink-0 !min-h-[52px] !px-6 shadow-lg shadow-emerald-500/20 sm:inline-flex"
          onClick={() => setForm({ stage: 'today' })}
        >
          <Plus className="h-5 w-5" /> Novo Bloco
        </button>
      </div>

      {/* Resumo */}
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Blocos concluídos" tone="bg-emerald-500/10 text-emerald-400" icon={<CheckCircle2 className="h-6 w-6" />}>
          <p className="font-mono text-3xl font-bold">
            {allDone.length}/{dayTotal} <span className="font-sans text-sm font-semibold text-emerald-400">hoje</span>
          </p>
        </Stat>
        <Stat label="Tempo focado hoje" tone="bg-indigo-500/10 text-indigo-300" icon={<Clock className="h-6 w-6" />}>
          <p className="font-mono text-3xl font-bold">
            {fmt(focused)} <span className="font-sans text-sm font-normal text-slate-400">/ {fmt(planned)} planejados</span>
          </p>
        </Stat>
        <Stat label="Progresso geral" tone="bg-amber-500/10 text-amber-400" icon={<Zap className="h-6 w-6" />}>
          <p className="font-mono text-3xl font-bold text-emerald-400">{pct}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </Stat>
      </div>

      {/* Filtros */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        <button className={chip(filter === 'Todos')} onClick={() => setFilter('Todos')}>Todos os Blocos</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={chip(filter === c)} onClick={() => setFilter(c)}>
            <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[c]}`} /> {c}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {loading && <p className="text-slate-400">Carregando...</p>}

      {/* Abas: só no mobile */}
      <div className="grid grid-cols-2 gap-2 lg:hidden">
        {(
          [
            ['today', 'Hoje', todayBlocks.length + doneToday.length],
            ['backlog', 'Backlog', backlog.length],
          ] as const
        ).map(([k, label, n]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`btn border ${
              tab === k ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}
          >
            {label} ({n})
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* HOJE */}
        <section className={`space-y-4 ${tab === 'today' ? 'block' : 'hidden'} lg:block`}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              Blocos de Hoje
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-400">
                {todayBlocks.length + doneToday.length}
              </span>
            </h2>
            <button className="btn-primary sm:hidden" onClick={() => setForm({ stage: 'today' })}>
              <Plus className="h-5 w-5" /> Novo
            </button>
          </div>

          {!loading && todayBlocks.length + doneToday.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-800 p-6 text-sm text-slate-400">
              Nenhum bloco para hoje. Mova algo do Backlog ou crie um novo.
            </div>
          )}

          {todayBlocks.map((b) => (
            <BlockCard key={b.id} block={b} api={api} onFocus={setFocusId} onEdit={edit} />
          ))}
          {doneToday.map((b) => (
            <BlockCard key={b.id} block={b} api={api} />
          ))}
        </section>

        {/* BACKLOG */}
        <aside
          className={`space-y-3 rounded-3xl border border-slate-800 bg-slate-900/40 p-4 ${
            tab === 'backlog' ? 'block' : 'hidden'
          } lg:block`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                Backlog
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-xs text-slate-300">
                  {backlogTotal}
                </span>
              </h2>
              <p className="mt-1 text-xs text-slate-400">Ideias e metas prontas para puxar quando abrir espaço.</p>
            </div>
            <button className="btn-ghost shrink-0 !px-3" onClick={() => setForm({ stage: 'backlog' })}>
              <Plus className="h-4 w-4" /> Guardar
            </button>
          </div>

          {!loading && backlog.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-800 p-4 text-sm text-slate-500">
              O Backlog está vazio.
            </p>
          )}

          {backlog.map((b) => (
            <BlockCard key={b.id} block={b} api={api} onEdit={edit} />
          ))}
        </aside>
      </div>

      {form && (
        <BlockForm
          block={form.block}
          defaultStage={form.stage}
          onClose={() => setForm(null)}
          onSave={(input, stage) => (form.block ? api.updateBlock(form.block.id, input) : api.createBlock(input, stage))}
        />
      )}

      {focusBlock && <FocusMode block={focusBlock} api={api} onClose={() => setFocusId(null)} />}
    </div>
  )
}
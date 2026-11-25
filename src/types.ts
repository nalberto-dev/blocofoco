export const CATEGORIES = ['Estudos', 'Projeto', 'Treino', 'Descanso'] as const
export type Category = (typeof CATEGORIES)[number]
export type Stage = 'backlog' | 'today' | 'completed'

export const CATEGORY_STYLE: Record<Category, string> = {
  Estudos: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  Projeto: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  Treino: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  Descanso: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
}

export const CATEGORY_DOT: Record<Category, string> = {
  Estudos: 'bg-indigo-400',
  Projeto: 'bg-emerald-400',
  Treino: 'bg-amber-400',
  Descanso: 'bg-sky-400',
}

export interface ChecklistItem {
  id: string
  block_id: string
  label: string
  is_completed: boolean
  order_index: number
}

export interface Block {
  id: string
  title: string
  category: Category
  estimated_minutes: number
  focused_minutes: number
  stage: Stage
  scheduled_date: string | null
  created_at: string
  block_checklist_items: ChecklistItem[]
}
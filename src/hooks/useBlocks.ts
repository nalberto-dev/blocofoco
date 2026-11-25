import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { todayStr } from '../lib/date'
import type { Block, Category, ChecklistItem, Stage } from '../types'

export interface BlockInput {
  title: string
  category: Category
  estimated_minutes: number
}

const sortItems = (b: Block): Block => ({
  ...b,
  block_checklist_items: [...(b.block_checklist_items ?? [])].sort((x, y) => x.order_index - y.order_index),
})

export function useBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('routine_blocks')
      .select('*, block_checklist_items(*)')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError('Não foi possível carregar seus blocos.')
        else setBlocks(((data ?? []) as Block[]).map(sortItems))
        setLoading(false)
      })
  }, [])

  const patchBlock = (id: string, p: Partial<Block>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...p } : b)))

  const setItems = (blockId: string, fn: (l: ChecklistItem[]) => ChecklistItem[]) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, block_checklist_items: fn(b.block_checklist_items) } : b)),
    )

  async function run(op: () => PromiseLike<{ error: unknown }>, msg: string, onOk: () => void) {
    setError('')
    const { error } = await op()
    if (error) {
      setError(msg)
      return false
    }
    onOk()
    return true
  }

  async function createBlock(input: BlockInput, stage: Stage = 'backlog') {
    setError('')
    const { data, error } = await supabase
      .from('routine_blocks')
      .insert({ ...input, stage, scheduled_date: stage === 'today' ? todayStr() : null })
      .select('*, block_checklist_items(*)')
      .single()
    if (error) {
      setError('Não foi possível criar o bloco.')
      return false
    }
    setBlocks((prev) => [...prev, sortItems(data as Block)])
    return true
  }

  const updateBlock = (id: string, input: BlockInput) =>
    run(
      () => supabase.from('routine_blocks').update(input).eq('id', id),
      'Não foi possível salvar o bloco.',
      () => patchBlock(id, input),
    )

  const deleteBlock = (id: string) =>
    run(
      () => supabase.from('routine_blocks').delete().eq('id', id),
      'Não foi possível excluir o bloco.',
      () => setBlocks((prev) => prev.filter((b) => b.id !== id)),
    )

  // Hoje <-> Backlog (e reabrir concluído)
  function moveBlock(id: string, stage: Stage) {
    const scheduled_date = stage === 'today' ? todayStr() : null
    return run(
      () => supabase.from('routine_blocks').update({ stage, scheduled_date }).eq('id', id),
      'Não foi possível mover o bloco.',
      () => patchBlock(id, { stage, scheduled_date }),
    )
  }

  // Soma o tempo focado e, opcionalmente, conclui o bloco
  function saveFocus(id: string, minutes: number, complete: boolean) {
    const b = blocks.find((x) => x.id === id)
    if (!b) return Promise.resolve(false)
    const patch: { focused_minutes: number; stage?: Stage; scheduled_date?: string } = {
      focused_minutes: b.focused_minutes + Math.max(0, minutes),
    }
    if (complete) {
      patch.stage = 'completed'
      patch.scheduled_date = todayStr()
    }
    return run(
      () => supabase.from('routine_blocks').update(patch).eq('id', id),
      'Não foi possível salvar o tempo focado.',
      () => patchBlock(id, patch),
    )
  }

  async function addItem(blockId: string, label: string) {
    setError('')
    const b = blocks.find((x) => x.id === blockId)
    const items = b?.block_checklist_items ?? []
    const order_index = items.length ? Math.max(...items.map((i) => i.order_index)) + 1 : 0
    const { data, error } = await supabase
      .from('block_checklist_items')
      .insert({ block_id: blockId, label: label.trim(), order_index })
      .select()
      .single()
    if (error) return setError('Não foi possível adicionar o item.')
    setItems(blockId, (l) => [...l, data as ChecklistItem])
  }

  async function toggleItem(item: ChecklistItem) {
    const next = !item.is_completed
    const apply = (v: boolean) =>
      setItems(item.block_id, (l) => l.map((i) => (i.id === item.id ? { ...i, is_completed: v } : i)))
    apply(next) // atualiza a tela na hora
    const { error } = await supabase.from('block_checklist_items').update({ is_completed: next }).eq('id', item.id)
    if (error) {
      apply(!next)
      setError('Não foi possível atualizar o item.')
    }
  }

  const removeItem = (item: ChecklistItem) =>
    run(
      () => supabase.from('block_checklist_items').delete().eq('id', item.id),
      'Não foi possível remover o item.',
      () => setItems(item.block_id, (l) => l.filter((i) => i.id !== item.id)),
    )

  return {
    blocks, loading, error,
    createBlock, updateBlock, deleteBlock, moveBlock, saveFocus,
    addItem, toggleItem, removeItem,
  }
}

export type BlocksApi = ReturnType<typeof useBlocks>
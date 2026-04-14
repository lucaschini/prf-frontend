import { useState, useCallback } from 'react'

const EMPTY = { ufs: [], brs: [], causas: [], topN: 150 }

export function useFilters() {
  const [draft,   setDraft]   = useState(EMPTY)
  const [applied, setApplied] = useState(EMPTY)

  const update = useCallback((key, val) =>
    setDraft(p => ({ ...p, [key]: val })), [])

  const apply = useCallback(() =>
    setApplied(p => ({ ...p, ...draft })), [draft])

  const reset = useCallback(() => {
    setDraft(EMPTY); setApplied(EMPTY)
  }, [])

  const toParams = useCallback((f = applied) => {
    const p = {}
    if (f.ufs?.length)    p.ufs    = f.ufs.join(',')
    if (f.brs?.length)    p.brs    = f.brs.join(',')
    if (f.causas?.length) p.causas = f.causas.join(',')
    if (f.topN)           p.top_n  = f.topN
    return p
  }, [applied])

  const hasActive = applied.ufs.length > 0
    || applied.brs.length > 0
    || applied.causas.length > 0

  return { draft, applied, update, apply, reset, toParams, hasActive }
}

const BASE = import.meta.env.VITE_API_URL || '/api'

async function get(path, params = {}) {
  const url = new URL(BASE + path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v)
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`)
  return res.json()
}

export const api = {
  meta:            ()       => get('/meta'),
  grafo:           (p)      => get('/grafo', p),
  dashTrechos:     (p)      => get('/dashboard/trechos', { n: 20, ...p }),
  dashCausas:      (p)      => get('/dashboard/causas', p),
  dashTemporal:    (p)      => get('/dashboard/temporal', p),
  dashUF:          (p)      => get('/dashboard/uf', p),
  dashClass:       (p)      => get('/dashboard/classificacao', p),
  dashHeatmap:     (p)      => get('/dashboard/heatmap', p),
  rankingsTrechos: (p)      => get('/rankings/trechos', { limite: 500, ...p }),
}

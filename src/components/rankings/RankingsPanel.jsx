import { useState, useMemo } from 'react'
import { useApi } from '../../hooks/useApi'
import { api } from '../../services/api'
import { Spinner, ErrorState } from '../shared/States'

const CAUSAS_PT = {
  excesso_velocidade:'Excesso de Velocidade', distracoes:'Distração/Celular',
  sono_fadiga:'Sono/Fadiga', alcool:'Álcool', ultrapassagem_indevida:'Ultrapassagem Indevida',
  distancia_seguranca:'Distância Insuficiente', defeito_pista:'Defeito na Pista',
  curva_perigosa:'Curva Perigosa', animal_na_pista:'Animal na Pista',
  condicao_climatica:'Cond. Climática', sinalizacao_deficiente:'Sinalização Deficiente',
  saida_de_pista:'Saída de Pista',
}

const fmt  = n => n?.toLocaleString('pt-BR') ?? '—'
const pct  = (a, b) => b > 0 ? `${(a/b*100).toFixed(1)}%` : '—'

// ── Tabela ordenável ──────────────────────────────────────────────────────
function SortTh({ col, label, sort, onSort }) {
  return (
    <th
      className="px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase text-gray-500 cursor-pointer select-none hover:text-gov-blue transition-colors whitespace-nowrap bg-gray-50 sticky top-0 border-b border-gray-200"
      onClick={() => onSort(col)}
    >
      {label}
      {sort.col === col && (
        <span className="ml-1 text-gov-blue">{sort.dir === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )
}

function TabelaTrechos({ params }) {
  const { data, loading, error } = useApi(
    () => api.rankingsTrechos(params), [JSON.stringify(params)]
  )
  const [sort, setSort] = useState({ col: 'score_risco', dir: 'desc' })

  const onSort = col =>
    setSort(s => ({ col, dir: s.col === col && s.dir === 'desc' ? 'asc' : 'desc' }))

  const sorted = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      const av = a[sort.col] ?? 0, bv = b[sort.col] ?? 0
      return sort.dir === 'asc' ? av - bv : bv - av
    })
  }, [data, sort])

  const exportCSV = () => {
    if (!sorted.length) return
    const cols = ['br','uf','km_inicio','municipio','score_risco','total_mortos','total_feridos_graves','total_feridos_leves','total_acidentes']
    const header = cols.join(',')
    const rows   = sorted.map(d => cols.map(c => d[c] ?? '').join(','))
    const csv    = [header, ...rows].join('\n')
    const a      = document.createElement('a')
    a.href       = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' }))
    a.download   = 'trechos_prf.csv'
    a.click()
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} />

  const maxScore = Math.max(...sorted.map(d => d.score_risco || 0))

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <p className="text-xs text-gray-400 font-mono">
          {sorted.length.toLocaleString('pt-BR')} trechos
        </p>
        <button onClick={exportCSV} className="btn-gov-outline text-xs py-1.5">
          ⬇ Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <SortTh col="br"                   label="BR"         sort={sort} onSort={onSort} />
              <SortTh col="uf"                   label="UF"         sort={sort} onSort={onSort} />
              <SortTh col="km_inicio"            label="KM"         sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase text-gray-500 bg-gray-50 sticky top-0 border-b border-gray-200 whitespace-nowrap">Município</th>
              <SortTh col="score_risco"          label="Score"      sort={sort} onSort={onSort} />
              <SortTh col="total_mortos"         label="Mortos"     sort={sort} onSort={onSort} />
              <SortTh col="total_feridos_graves" label="F. Graves"  sort={sort} onSort={onSort} />
              <SortTh col="total_acidentes"      label="Acidentes"  sort={sort} onSort={onSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((d, i) => (
              <tr key={i} className="hover:bg-gov-blue-bg transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-medium">{d.br}</td>
                <td className="px-3 py-2 text-xs font-semibold text-gov-blue">{d.uf}</td>
                <td className="px-3 py-2 font-mono text-xs">{d.km_inicio != null ? (+d.km_inicio).toFixed(0) : '—'}</td>
                <td className="px-3 py-2 text-xs text-gray-600 max-w-[140px] truncate">{d.municipio || '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gov-blue">{(+d.score_risco||0).toFixed(1)}</span>
                    <div className="h-1.5 bg-red-100 rounded-full overflow-hidden w-12">
                      <div className="h-full bg-risk-high rounded-full" style={{ width: `${Math.round((d.score_risco||0)/maxScore*100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-xs font-semibold text-danger">{fmt(d.total_mortos)}</td>
                <td className="px-3 py-2 font-mono text-xs">{fmt(d.total_feridos_graves)}</td>
                <td className="px-3 py-2 font-mono text-xs">{fmt(d.total_acidentes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RankUF({ params }) {
  const { data, loading, error } = useApi(() => api.dashUF(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold tracking-wider uppercase text-gray-500">
            <th className="px-3 py-2.5 text-center">#</th>
            <th className="px-3 py-2.5 text-left">UF</th>
            <th className="px-3 py-2.5 text-right">Acidentes</th>
            <th className="px-3 py-2.5 text-right">Mortos</th>
            <th className="px-3 py-2.5 text-right">Mortos/Acidente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data?.map((d, i) => (
            <tr key={d.uf} className="hover:bg-gov-blue-bg transition-colors">
              <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">{i+1}</td>
              <td className="px-3 py-2 font-semibold text-gov-blue text-sm">{d.uf}</td>
              <td className="px-3 py-2 font-mono text-xs text-right">{fmt(d.total)}</td>
              <td className="px-3 py-2 font-mono text-xs font-semibold text-danger text-right">{fmt(d.mortos)}</td>
              <td className="px-3 py-2 font-mono text-xs text-right">{pct(d.mortos, d.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RankCausas({ params }) {
  const { data, loading, error } = useApi(() => api.dashCausas(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold tracking-wider uppercase text-gray-500">
            <th className="px-3 py-2.5 text-center">#</th>
            <th className="px-3 py-2.5 text-left">Causa</th>
            <th className="px-3 py-2.5 text-right">Acidentes</th>
            <th className="px-3 py-2.5 text-right">Mortos</th>
            <th className="px-3 py-2.5 text-right">Letalidade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data?.map((d, i) => (
            <tr key={d.id} className="hover:bg-gov-blue-bg transition-colors">
              <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">{i+1}</td>
              <td className="px-3 py-2 text-xs text-gray-700">{CAUSAS_PT[d.id] || d.id}</td>
              <td className="px-3 py-2 font-mono text-xs text-right">{fmt(d.total)}</td>
              <td className="px-3 py-2 font-mono text-xs font-semibold text-danger text-right">{fmt(d.mortos)}</td>
              <td className="px-3 py-2 font-mono text-xs text-right">{pct(d.mortos, d.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SUB_TABS = [
  { id: 'trechos', label: 'Trechos' },
  { id: 'uf',      label: 'Por Estado' },
  { id: 'causas',  label: 'Por Causa' },
]

export function RankingsPanel({ params }) {
  const [sub, setSub] = useState('trechos')

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-screen-xl mx-auto">
        {/* Sub-tabs */}
        <div className="flex gap-0 mb-4 border-b border-gray-200">
          {SUB_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                sub === t.id
                  ? 'text-gov-blue border-gov-blue font-semibold'
                  : 'text-gray-500 border-transparent hover:text-gov-blue',
              ].join(' ')}
            >{t.label}</button>
          ))}
        </div>

        {sub === 'trechos' && <TabelaTrechos params={params} />}
        {sub === 'uf'      && <RankUF params={params} />}
        {sub === 'causas'  && <RankCausas params={params} />}
      </div>
    </div>
  )
}

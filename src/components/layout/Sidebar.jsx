import { useState } from 'react'
import { MetricCard } from '../shared/MetricCard'

const CAUSAS = {
  excesso_velocidade:     'Excesso de Velocidade',
  distracoes:             'Distração / Celular',
  sono_fadiga:            'Sono / Fadiga',
  alcool:                 'Álcool',
  ultrapassagem_indevida: 'Ultrapassagem Indevida',
  distancia_seguranca:    'Distância Insuficiente',
  defeito_pista:          'Defeito na Pista',
  curva_perigosa:         'Curva Perigosa',
  animal_na_pista:        'Animal na Pista',
  condicao_climatica:     'Condição Climática',
  sinalizacao_deficiente: 'Sinalização Deficiente',
  saida_de_pista:         'Saída de Pista',
}

function MultiSelect({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const toggle = v =>
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v])
  const n = value.length

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:border-gov-blue transition-colors"
        aria-expanded={open}
      >
        <span className="truncate">
          {n ? `${n} selecionado${n > 1 ? 's' : ''}` : placeholder}
        </span>
        <span className="text-[9px] text-gray-400 ml-2 flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-0.5 border border-gray-200 rounded bg-white shadow-md max-h-44 overflow-y-auto z-10 relative">
          {options.map(o => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gov-blue-bg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="accent-gov-blue w-3.5 h-3.5 flex-shrink-0"
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ meta, draft, onUpdate, onApply, onReset, hasActive, open, onClose }) {
  const { metricas = {}, ufs = [], brs = [], ultima_atualizacao } = meta || {}

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={[
          'w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto flex flex-col',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 shadow-xl',
          'lg:static lg:translate-x-0 lg:shadow-none lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Filtros e métricas"
      >
        {/* Fechar mobile */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 lg:hidden">
          <span className="section-label">Filtros</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Fechar"
          >×</button>
        </div>

        {/* Métricas */}
        <section className="px-4 pt-4 pb-2">
          <h2 className="section-label mb-3">Visão Geral</h2>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Acidentes" value={metricas.total}  variant="accent"  delay={0}   />
            <MetricCard label="Mortos"    value={metricas.mortos} variant="danger"  delay={100} />
            <MetricCard label="F. Graves" value={metricas.graves} variant="warning" delay={200} />
            <MetricCard label="F. Leves"  value={metricas.leves}  delay={300}       />
          </div>
          {ultima_atualizacao && (
            <p className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gov-green flex-shrink-0" />
              Atualizado em {ultima_atualizacao}
            </p>
          )}
        </section>

        <div className="h-px bg-gray-100 my-2" />

        {/* Filtros */}
        <section className="px-4 py-3 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-label">Filtros</h2>
            {hasActive && (
              <button
                onClick={onReset}
                className="text-xs text-gov-blue underline hover:text-gov-blue-dark"
              >Limpar tudo</button>
            )}
          </div>

          <MultiSelect
            label="Estado (UF)"
            options={ufs.map(v => ({ value: v, label: v }))}
            value={draft.ufs}
            onChange={v => onUpdate('ufs', v)}
            placeholder="Todos os estados"
          />

          <MultiSelect
            label="Rodovia"
            options={brs.map(v => ({ value: v, label: `BR-${v}` }))}
            value={draft.brs}
            onChange={v => onUpdate('brs', v)}
            placeholder="Todas as rodovias"
          />

          <MultiSelect
            label="Causa do acidente"
            options={Object.entries(CAUSAS).map(([k, v]) => ({ value: k, label: v }))}
            value={draft.causas}
            onChange={v => onUpdate('causas', v)}
            placeholder="Todas as causas"
          />

          <div className="mb-4">
            <label className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
              Trechos no grafo
              <span className="font-mono text-gov-blue font-medium">{draft.topN}</span>
            </label>
            <input
              type="range" min={50} max={300} step={25}
              value={draft.topN}
              onChange={e => onUpdate('topN', +e.target.value)}
              className="w-full accent-gov-blue cursor-pointer"
            />
          </div>

          <button onClick={onApply} className="btn-gov w-full text-sm justify-center">
            Aplicar filtros
          </button>
        </section>

        <div className="h-px bg-gray-100" />

        {/* Sobre */}
        <section className="px-4 py-4">
          <h2 className="section-label mb-2">Sobre</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Projeto de extensão universitária que analisa os dados abertos da PRF para
            identificar os trechos e combinações de causas mais letais das rodovias federais.
          </p>
          <div className="flex flex-wrap gap-1">
            {['ODS 3','ODS 11','Python','MongoDB','React','FastAPI'].map(t => (
              <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gov-blue-bg text-gov-blue border border-gov-blue-light">
                {t}
              </span>
            ))}
          </div>
        </section>
      </aside>
    </>
  )
}

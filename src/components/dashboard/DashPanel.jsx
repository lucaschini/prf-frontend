import { useApi } from '../../hooks/useApi'
import { api } from '../../services/api'
import { Spinner, ErrorState } from '../shared/States'
import Plot from 'react-plotly.js'

// ── Tema Plotly compartilhado ─────────────────────────────────────────────
const PLT_BASE = {
  paper_bgcolor: 'transparent',
  plot_bgcolor:  'transparent',
  font: { family: 'Source Code Pro, monospace', size: 11, color: '#6b7280' },
  margin: { l: 8, r: 8, t: 8, b: 8, pad: 0 },
  hoverlabel: { bgcolor: '#1f2937', font: { color: '#f9fafb', size: 12 } },
  colorway: ['#1351B4','#e63946','#f4a261','#2a9d8f','#ffb703','#7b0d1e'],
}
const AXIS = { color: '#9ca3af', gridcolor: '#f3f4f6', zerolinecolor: '#e5e7eb', linecolor: '#e5e7eb' }
const CFG  = { displayModeBar: false, responsive: true }

function ChartCard({ title, children, full = false }) {
  return (
    <div className={`card p-4 ${full ? 'col-span-2' : ''}`}>
      <p className="section-label mb-3">{title}</p>
      {children}
    </div>
  )
}

// ── Gráfico 1: Top trechos ────────────────────────────────────────────────
function GraficoTrechos({ params }) {
  const { data, loading, error } = useApi(() => api.dashTrechos(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error || !data?.length) return <ErrorState message={error} />

  const max = Math.max(...data.map(d => d.score_risco || 0))
  const labels = [...data].reverse().map(d => `BR-${d.br} KM${d.km_inicio} (${d.uf})`)
  const scores = [...data].reverse().map(d => d.score_risco || 0)
  const mortos = [...data].reverse().map(d => d.total_mortos || 0)

  return (
    <Plot
      data={[
        {
          type: 'bar', orientation: 'h',
          x: scores, y: labels, name: 'Score de Risco',
          marker: { color: scores.map(s => s === max ? '#7b0d1e' : s >= max * 0.7 ? '#c1121f' : '#e63946') },
          hovertemplate: '<b>%{y}</b><br>Score: %{x:.1f}<extra></extra>',
        },
        {
          type: 'scatter', mode: 'markers',
          x: mortos, y: labels, name: 'Mortos',
          marker: { color: '#f59e0b', size: 7, symbol: 'diamond' },
          xaxis: 'x2',
          hovertemplate: 'Mortos: <b>%{x}</b><extra></extra>',
        },
      ]}
      layout={{
        ...PLT_BASE,
        height: 380,
        xaxis:  { ...AXIS },
        xaxis2: { ...AXIS, overlaying: 'x', side: 'top', showgrid: false },
        yaxis:  { color: '#6b7280', tickfont: { size: 10 } },
        legend: { orientation: 'h', y: 1.12, font: { size: 10 } },
        bargap: 0.28,
      }}
      config={CFG}
      style={{ width: '100%' }}
      useResizeHandler
    />
  )
}

// ── Gráfico 2: Causas ─────────────────────────────────────────────────────
function GraficoCausas({ params }) {
  const { data, loading, error } = useApi(() => api.dashCausas(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error || !data?.length) return <ErrorState message={error} />

  const sorted = [...data].sort((a, b) => a.total - b.total)
  const labels = sorted.map(d => d.id.replace(/_/g, ' '))
  const totais = sorted.map(d => d.total)
  const taxa   = sorted.map(d => d.total > 0 ? +(d.mortos / d.total * 100).toFixed(1) : 0)

  return (
    <Plot
      data={[
        { type: 'bar', orientation: 'h', x: totais, y: labels, name: 'Acidentes', marker: { color: '#1351B4' }, hovertemplate: '<b>%{y}</b><br>%{x:,}<extra></extra>' },
        { type: 'scatter', mode: 'markers', x: taxa, y: labels, name: 'Mortalidade %', marker: { color: '#e63946', size: 8 }, xaxis: 'x2', hovertemplate: 'Mortalidade: <b>%{x}%</b><extra></extra>' },
      ]}
      layout={{
        ...PLT_BASE, height: 320,
        xaxis:  { ...AXIS },
        xaxis2: { ...AXIS, overlaying: 'x', side: 'top', showgrid: false },
        yaxis:  { color: '#6b7280', tickfont: { size: 10 } },
        legend: { orientation: 'h', y: 1.14, font: { size: 10 } },
        bargap: 0.25,
      }}
      config={CFG} style={{ width: '100%' }} useResizeHandler
    />
  )
}

// ── Gráfico 3: Classificação ──────────────────────────────────────────────
function GraficoClassificacao({ params }) {
  const { data, loading, error } = useApi(() => api.dashClass(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error || !data?.length) return <ErrorState message={error} />

  const COR = { fatal: '#e63946', com_feridos: '#f4a261', sem_vitimas: '#2a9d8f', desconhecido: '#d1d5db' }
  const LAB = { fatal: 'Fatal', com_feridos: 'Com Feridos', sem_vitimas: 'Sem Vítimas', desconhecido: 'Desconhecido' }

  return (
    <Plot
      data={[{
        type: 'pie',
        labels: data.map(d => LAB[d.id] || d.id),
        values: data.map(d => d.total),
        marker: { colors: data.map(d => COR[d.id] || '#9ca3af') },
        hole: 0.55, textinfo: 'percent',
        hovertemplate: '<b>%{label}</b><br>%{value:,} (%{percent})<extra></extra>',
      }]}
      layout={{ ...PLT_BASE, height: 280, legend: { orientation: 'v', x: 1, font: { size: 10 } } }}
      config={CFG} style={{ width: '100%' }} useResizeHandler
    />
  )
}

// ── Gráfico 4: Temporal ───────────────────────────────────────────────────
function GraficoTemporal({ params }) {
  const { data, loading, error } = useApi(() => api.dashTemporal(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error || !data?.length) return <ErrorState message={error} />

  const dates  = data.map(d => `${d.ano}-${String(d.mes).padStart(2,'0')}-01`)
  const totais = data.map(d => d.total)
  const mortos = data.map(d => d.mortos)

  return (
    <Plot
      data={[
        { type:'scatter', mode:'lines+markers', x:dates, y:totais, name:'Acidentes', line:{color:'#1351B4',width:2}, marker:{size:4}, fill:'tozeroy', fillcolor:'rgba(19,81,180,0.06)', hovertemplate:'%{x|%b/%Y}<br>Acidentes: <b>%{y:,}</b><extra></extra>' },
        { type:'scatter', mode:'lines+markers', x:dates, y:mortos, name:'Mortos',    line:{color:'#e63946',width:2,dash:'dot'}, marker:{size:4}, yaxis:'y2', hovertemplate:'Mortos: <b>%{y:,}</b><extra></extra>' },
      ]}
      layout={{
        ...PLT_BASE, height: 280,
        xaxis: {
          ...AXIS, type: 'date',
          rangeselector: {
            bgcolor:'#f9fafb', activecolor:'#1351B4', font:{color:'#6b7280',size:10},
            buttons:[
              {count:6,label:'6m',step:'month',stepmode:'backward'},
              {count:1,label:'1a',step:'year',stepmode:'backward'},
              {step:'all',label:'Tudo'},
            ],
          },
          rangeslider:{bgcolor:'#f9fafb',thickness:0.06},
        },
        yaxis:  { ...AXIS, title:'Acidentes', titlefont:{color:'#1351B4'} },
        yaxis2: { ...AXIS, title:'Mortos', titlefont:{color:'#e63946'}, overlaying:'y', side:'right', showgrid:false },
        legend: { orientation:'h', y:1.14, font:{size:10} },
        hovermode:'x unified',
      }}
      config={CFG} style={{ width: '100%' }} useResizeHandler
    />
  )
}

// ── Gráfico 5: UF ─────────────────────────────────────────────────────────
function GraficoUF({ params }) {
  const { data, loading, error } = useApi(() => api.dashUF(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error || !data?.length) return <ErrorState message={error} />

  const maxM = Math.max(...data.map(d => d.mortos))

  return (
    <Plot
      data={[{
        type:'scatter', mode:'markers+text',
        x: data.map(d => d.total),
        y: data.map(d => d.mortos),
        text: data.map(d => d.uf),
        textposition:'top center', textfont:{size:10, color:'#9ca3af'},
        marker:{
          size: data.map(d => 10 + (d.mortos / maxM) * 28),
          color: data.map(d => d.mortos),
          colorscale:[[0,'#dbeafe'],[0.5,'#c1121f'],[1,'#7b0d1e']],
          line:{color:'#e63946',width:1},
        },
        hovertemplate:'<b>%{text}</b><br>Acidentes: %{x:,}<br>Mortos: %{y:,}<extra></extra>',
      }]}
      layout={{ ...PLT_BASE, height:280, xaxis:{...AXIS,title:'Acidentes'}, yaxis:{...AXIS,title:'Mortos'}, showlegend:false }}
      config={CFG} style={{ width:'100%' }} useResizeHandler
    />
  )
}

// ── Gráfico 6: Heatmap ────────────────────────────────────────────────────
function GraficoHeatmap({ params }) {
  const { data, loading, error } = useApi(() => api.dashHeatmap(params), [JSON.stringify(params)])
  if (loading) return <Spinner />
  if (error || !data?.length) return <ErrorState message={error} />

  const ORDEM_FASE  = ['manha','tarde','noite','madrugada','amanhecer','anoitecer']
  const ORDEM_PISTA = ['simples','dupla','multipla']

  const fases  = [...new Set(data.map(d => d.fase))].sort((a,b) => ORDEM_FASE.indexOf(a)-ORDEM_FASE.indexOf(b))
  const pistas = [...new Set(data.map(d => d.pista))].sort((a,b) => ORDEM_PISTA.indexOf(a)-ORDEM_PISTA.indexOf(b))
  const z = pistas.map(p => fases.map(f => { const r=data.find(d=>d.fase===f&&d.pista===p); return r?r.mortos:0 }))
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <Plot
      data={[{
        type:'heatmap', x:fases.map(cap), y:pistas.map(cap), z,
        colorscale:[[0,'#eff6ff'],[0.4,'#7b0d1e'],[0.7,'#e63946'],[1,'#fbbf24']],
        hovertemplate:'<b>%{y}</b> × <b>%{x}</b><br>Mortos: %{z}<extra></extra>',
      }]}
      layout={{ ...PLT_BASE, height:240, xaxis:{color:'#6b7280',tickangle:-20}, yaxis:{color:'#6b7280'} }}
      config={CFG} style={{ width:'100%' }} useResizeHandler
    />
  )
}

// ── Painel principal ──────────────────────────────────────────────────────
export function DashPanel({ params }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Trechos com Maior Score de Risco" full>
          <GraficoTrechos params={params} />
        </ChartCard>

        <ChartCard title="Causas — Frequência e Mortalidade" full>
          <GraficoCausas params={params} />
        </ChartCard>

        <ChartCard title="Evolução Mensal de Acidentes e Mortos" full>
          <GraficoTemporal params={params} />
        </ChartCard>

        <ChartCard title="Acidentes × Mortos por UF">
          <GraficoUF params={params} />
        </ChartCard>

        <ChartCard title="Classificação dos Acidentes">
          <GraficoClassificacao params={params} />
        </ChartCard>

        <ChartCard title="Mortos por Tipo de Pista × Fase do Dia" full>
          <GraficoHeatmap params={params} />
        </ChartCard>
      </div>
    </div>
  )
}

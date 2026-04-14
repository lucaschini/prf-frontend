import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
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

const COR_ARESTA = { trecho_causa:'#e63946', pertencimento:'#d1d5db', co_causa:'#2a9d8f' }

function buildStyle(colorMode) {
  return [
    {
      selector: 'node[tipo="trecho"]',
      style: {
        'background-color': colorMode === 'cluster' ? 'data(corCom)' : 'data(cor)',
        'width': 'data(size)', 'height': 'data(size)',
        'shape': 'ellipse',
        'label': 'data(label)',
        'font-size': 9, 'font-family': 'Source Code Pro, monospace',
        'color': '#6b7280', 'text-valign': 'bottom',
        'text-margin-y': 5, 'border-width': 1, 'border-color': '#e5e7eb',
      }
    },
    {
      selector: 'node[tipo="causa"]',
      style: {
        'background-color': colorMode === 'cluster' ? 'data(corCom)' : '#374151',
        'width': 22, 'height': 22, 'shape': 'rectangle',
        'label': 'data(label)',
        'font-size': 9, 'font-family': 'Source Code Pro, monospace',
        'color': '#6b7280', 'text-valign': 'bottom',
        'text-margin-y': 5, 'border-width': 1, 'border-color': '#9ca3af',
      }
    },
    {
      selector: 'node[tipo="rodovia"]',
      style: {
        'background-color': colorMode === 'cluster' ? 'data(corCom)' : '#f4a261',
        'width': 28, 'height': 28, 'shape': 'triangle',
        'label': 'data(label)',
        'font-size': 10, 'font-weight': 'bold',
        'font-family': 'Source Code Pro, monospace',
        'color': '#92400e', 'text-valign': 'bottom', 'text-margin-y': 6,
      }
    },
    { selector: 'edge[tipo="trecho_causa"]', style: { 'line-color':'#fca5a5', 'opacity':0.5, 'width':1, 'curve-style':'bezier' } },
    { selector: 'edge[tipo="pertencimento"]', style: { 'line-color':'#e5e7eb', 'opacity':0.6, 'width':1, 'line-style':'dashed', 'curve-style':'bezier' } },
    { selector: 'node:selected', style: { 'border-width':3, 'border-color':'#1351B4' } },
    { selector: 'node.dimmed', style: { 'opacity':0.25 } },
    { selector: 'edge.dimmed', style: { 'opacity':0.08 } },
  ]
}

function DetailDrawer({ node, onClose }) {
  if (!node) return null
  const d = node
  const isTrecho = d.tipo === 'trecho'

  return (
    <div className="absolute top-3 right-3 w-72 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-in overflow-hidden z-10">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 bg-gov-blue-bg">
        <div>
          <p className="section-label text-gov-blue">{d.tipo}</p>
          <p className="font-semibold text-gray-800 text-sm mt-0.5">{d.label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-2 mt-0.5"
          aria-label="Fechar"
        >×</button>
      </div>

      <div className="px-4 py-3 space-y-1.5 text-sm max-h-[70vh] overflow-y-auto">
        {isTrecho ? (
          <>
            {/* Métricas de destaque */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { l: 'Score', v: d.score_risco, c: 'text-gov-blue' },
                { l: 'Mortos', v: d.total_mortos, c: 'text-danger' },
                { l: 'Acidentes', v: d.total_acidentes, c: 'text-gray-700' },
              ].map(({ l, v, c }) => (
                <div key={l} className="bg-gray-50 rounded p-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{l}</p>
                  <p className={`font-mono font-semibold ${c}`}>{v ?? '—'}</p>
                </div>
              ))}
            </div>

            <Row k="Rodovia"    v={`BR-${d.br}`} />
            <Row k="Estado"     v={d.uf} />
            <Row k="KM"         v={d.km_inicio} />
            <Row k="Município"  v={d.municipio} />
            <Row k="F. Graves"  v={d.feridos_graves} />
            <Row k="Degree"     v={d.degree} />
            <Row k="Betweenness" v={d.betweenness} />
            <Row k="Cluster"    v={d.comunidade} />

            {d.causas?.length > 0 && (
              <div className="mt-3">
                <p className="section-label mb-1.5">Causas presentes</p>
                <div className="flex flex-wrap gap-1">
                  {d.causas.map(c => (
                    <span key={c} className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded">
                      {CAUSAS_PT[c] || c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : d.tipo === 'causa' ? (
          <>
            <Row k="Causa"      v={d.label} />
            <Row k="Degree"     v={d.degree} />
            <Row k="Betweenness" v={d.betweenness} />
            <Row k="Cluster"    v={d.comunidade} />
            <Row k="Trechos conectados" v={node._cy?.connectedEdges('[tipo="trecho_causa"]').length ?? '—'} />
          </>
        ) : (
          <Row k="Rodovia" v={d.label} />
        )}
      </div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-50 text-xs">
      <span className="text-gray-400">{k}</span>
      <span className="font-medium text-gray-700 font-mono">{v ?? '—'}</span>
    </div>
  )
}

export function GrafoPanel({ params }) {
  const cyRef      = useRef(null)
  const cyInst     = useRef(null)
  const [selected, setSelected] = useState(null)
  const [colorMode, setColorMode] = useState('tipo')

  const { data, loading, error, reload } = useApi(
    () => api.grafo(params), [JSON.stringify(params)]
  )

  useEffect(() => {
    if (!data || loading) return
    if (cyInst.current) { cyInst.current.destroy(); cyInst.current = null }
    setSelected(null)

    cyInst.current = cytoscape({
      container: cyRef.current,
      elements: [
        ...data.nodes.map(n => ({ data: n.data })),
        ...data.edges.map(e => ({ data: e.data })),
      ],
      layout: {
        name: 'cose', animate: false, randomize: true,
        nodeRepulsion: () => 8000, idealEdgeLength: () => 120,
        edgeElasticity: () => 200, gravity: 0.4, numIter: 1000,
      },
      style: buildStyle(colorMode),
      wheelSensitivity: 0.3,
    })

    const cy = cyInst.current

    // Clique em nó → abre drawer
    cy.on('tap', 'node', e => {
      const n = e.target
      const nodeData = { ...n.data(), _cy: n }
      setSelected(nodeData)
      // Destaca vizinhos
      cy.elements().addClass('dimmed')
      n.removeClass('dimmed')
      n.neighborhood().removeClass('dimmed')
    })

    // Clique no fundo → fecha drawer
    cy.on('tap', e => {
      if (e.target === cy) {
        setSelected(null)
        cy.elements().removeClass('dimmed')
      }
    })

    return () => { cy.destroy(); cyInst.current = null }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // Atualiza estilo ao mudar colorMode sem re-build
  useEffect(() => {
    if (cyInst.current) cyInst.current.style(buildStyle(colorMode))
  }, [colorMode])

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner label="Construindo grafo..." /></div>
  if (error)   return <div className="flex-1 flex items-center justify-center"><ErrorState message={error} onRetry={reload} /></div>

  const stats = data ? `${data.total_nos} nós · ${data.total_arestas} arestas` : ''

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Barra de controles do grafo */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Legenda */}
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { shape: 'circle',  bg: 'bg-risk-high',  label: 'Trecho' },
              { shape: 'square',  bg: 'bg-gray-700',   label: 'Causa' },
              { shape: 'triangle',bg: 'bg-risk-low',   label: 'Rodovia' },
            ].map(({ shape, bg, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`inline-block w-2.5 h-2.5 ${bg} ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-sm' : ''} flex-shrink-0`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">{stats}</span>
          {/* Toggle cor */}
          <div className="flex rounded border border-gray-200 overflow-hidden text-xs">
            {[['tipo','Tipo'],['cluster','Cluster']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setColorMode(v)}
                className={`px-3 py-1 transition-colors ${colorMode === v ? 'bg-gov-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas do Cytoscape */}
      <div className="flex-1 relative">
        <div ref={cyRef} className="w-full h-full bg-gray-50" />

        {/* Dica inicial */}
        {!selected && data?.total_nos > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-500 shadow-sm pointer-events-none animate-fade-in">
            Clique em um nó para ver detalhes
          </div>
        )}

        {/* Drawer de detalhes */}
        <DetailDrawer node={selected} onClose={() => {
          setSelected(null)
          cyInst.current?.elements().removeClass('dimmed')
        }} />
      </div>
    </div>
  )
}

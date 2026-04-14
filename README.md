# PRF Acidentes — Frontend React

Interface pública responsiva para visualização da Rede de Acidentes em Rodovias Federais.
Design baseado no Design System GOV.BR com identidade visual própria do projeto.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS 3** — utilitários com tema customizado GOV.BR
- **Cytoscape.js** — grafo interativo de trechos × causas
- **Plotly.js / react-plotly.js** — 6 gráficos analíticos
- **Fontes:** Rawline (GOV.BR oficial) + Source Code Pro

## Pré-requisitos

- Node.js ≥ 18
- Backend FastAPI rodando (ver `prf_api/`)

## Instalação

```bash
cd prf_react
npm install
```

## Desenvolvimento

```bash
# Inicia o frontend em http://localhost:5173
# O proxy /api aponta automaticamente para http://localhost:8000
npm run dev
```

## Build para produção

```bash
npm run build
# Gera pasta dist/ — sirva com qualquer servidor estático
```

## Variáveis de ambiente

Crie `.env.local` para customizar a URL da API:

```env
VITE_API_URL=https://sua-api.exemplo.com/api
```

## Estrutura

```
src/
  App.jsx                        ← raiz: layout + roteamento de abas
  main.jsx                       ← entry point React
  index.css                      ← Tailwind directives + componentes globais
  services/
    api.js                       ← chamadas à API FastAPI
  hooks/
    useApi.js                    ← hook genérico de fetch com loading/error
    useFilters.js                ← estado dos filtros (draft + applied)
  components/
    layout/
      GovHeader.jsx              ← barra GOV.BR + barra do sistema
      Sidebar.jsx                ← métricas animadas + filtros
      TabBar.jsx                 ← navegação entre abas
    shared/
      MetricCard.jsx             ← card com contador animado
      States.jsx                 ← Spinner, ErrorState, EmptyState
    grafo/
      GrafoPanel.jsx             ← Cytoscape.js + drawer de detalhes
    dashboard/
      DashPanel.jsx              ← 6 gráficos Plotly responsivos
    rankings/
      RankingsPanel.jsx          ← tabela ordenável + export CSV + rankings
```

## Deploy — Netlify / Vercel

1. Faça build: `npm run build`
2. Suba a pasta `dist/`
3. Configure a variável de ambiente `VITE_API_URL` apontando para sua API

### Proxy no Vite (dev)

O `vite.config.js` já configura proxy de `/api` → `http://localhost:8000`.
Em produção, configure o proxy no seu servidor (nginx, Caddy, etc).

```nginx
# nginx.conf
location /api/ {
    proxy_pass http://localhost:8000/api/;
}
location / {
    try_files $uri $uri/ /index.html;
}
```

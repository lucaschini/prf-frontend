import { useState } from "react";
import { useApi } from "./hooks/useApi";
import { useFilters } from "./hooks/useFilters";
import { api } from "./services/api";

import { Sidebar } from "./components/layout/Sidebar";
import { TabBar } from "./components/layout/TabBar";
import { GrafoPanel } from "./components/grafo/GrafoPanel";
import { DashPanel } from "./components/dashboard/DashPanel";
import { RankingsPanel } from "./components/rankings/RankingsPanel";
import { ErrorState } from "./components/shared/States";

export function App() {
  const [tab, setTab] = useState("grafo");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { draft, applied, update, apply, reset, toParams, hasActive } =
    useFilters();
  const { data: meta, error: metaError } = useApi(() => api.meta(), []);

  const params = toParams(applied);

  function handleApply() {
    apply();
    setSidebarOpen(false);
  }

  if (metaError) {
    return (
      <div className="min-h-screen flex flex-col">
        <GovHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <p className="text-4xl mb-4">🔌</p>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              API não disponível
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Certifique-se de que o backend FastAPI está rodando em{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">
                localhost:8000
              </code>
              .
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-gov"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Corpo: sidebar + conteúdo ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — escondida no mobile, fixa no desktop */}
        <Sidebar
          meta={meta}
          draft={draft}
          onUpdate={update}
          onApply={handleApply}
          onReset={reset}
          hasActive={hasActive}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Área principal */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Filtros ativos (banner) */}
          {hasActive && (
            <div className="bg-gov-blue-bg border-b border-gov-blue-light px-4 py-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-gov-blue font-semibold">
                Filtros ativos:
              </span>
              {applied.ufs.length > 0 && (
                <FilterTag
                  label={`UF: ${applied.ufs.join(", ")}`}
                  onRemove={() => {
                    update("ufs", []);
                    apply();
                  }}
                />
              )}
              {applied.brs.length > 0 && (
                <FilterTag
                  label={`BR: ${applied.brs.map((b) => `BR-${b}`).join(", ")}`}
                  onRemove={() => {
                    update("brs", []);
                    apply();
                  }}
                />
              )}
              {applied.causas.length > 0 && (
                <FilterTag
                  label={`${applied.causas.length} causa(s)`}
                  onRemove={() => {
                    update("causas", []);
                    apply();
                  }}
                />
              )}
              <button
                onClick={reset}
                className="ml-auto text-gov-blue underline hover:text-gov-blue-dark"
              >
                Limpar tudo
              </button>
            </div>
          )}

          {/* TabBar */}
          <TabBar active={tab} onChange={setTab} />

          {/* Painéis */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {tab === "grafo" && <GrafoPanel params={params} />}
            {tab === "dash" && <DashPanel params={params} />}
            {tab === "rankings" && <RankingsPanel params={params} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gov-blue-light rounded-full text-gov-blue">
      {label}
      <button
        onClick={onRemove}
        className="text-gov-blue/60 hover:text-gov-blue ml-0.5 leading-none"
        aria-label="Remover filtro"
      >
        ×
      </button>
    </span>
  );
}

export function Spinner({ label = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <div
        className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gov-blue animate-spin"
        role="status" aria-label={label}
      />
      <span className="text-xs tracking-wider">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
      <span className="text-3xl opacity-50">⚠</span>
      <p className="text-sm text-center max-w-xs">{message || 'Erro ao carregar dados.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-gov text-xs">
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Nenhum dado encontrado.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <span className="text-3xl opacity-40">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  )
}

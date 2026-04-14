import { useEffect, useRef, useState } from 'react'

function animateCount(from, to, ms, cb) {
  const start = performance.now()
  const fn = now => {
    const p = Math.min((now - start) / ms, 1)
    const ease = 1 - Math.pow(1 - p, 3)
    cb(Math.round(from + (to - from) * ease))
    if (p < 1) requestAnimationFrame(fn)
  }
  requestAnimationFrame(fn)
}

export function MetricCard({ label, value, variant = 'default', delay = 0 }) {
  const [shown, setShown] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    if (value == null) return
    const t = setTimeout(() => {
      animateCount(prev.current, value, 900, setShown)
      prev.current = value
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay])

  const fmt = n => n?.toLocaleString('pt-BR') ?? '—'

  const borderColor = {
    default: 'border-t-gov-blue-light',
    accent:  'border-t-gov-blue',
    danger:  'border-t-danger',
    warning: 'border-t-yellow-400',
  }[variant]

  const valueColor = {
    default: 'text-gray-800',
    accent:  'text-gov-blue',
    danger:  'text-danger',
    warning: 'text-yellow-600',
  }[variant]

  return (
    <div
      className={`card border-t-4 ${borderColor} p-4 flex flex-col gap-1 animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="section-label">{label}</span>
      <span className={`font-mono text-3xl font-medium leading-none tracking-tight ${valueColor}`}>
        {value != null ? fmt(shown) : '—'}
      </span>
    </div>
  )
}

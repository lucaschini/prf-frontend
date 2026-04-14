import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(fetcher, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const abort                 = useRef(null)

  const load = useCallback(async () => {
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setLoading(true); setError(null)
    try {
      const res = await fetcher()
      if (!ctrl.signal.aborted) { setData(res); setLoading(false) }
    } catch (e) {
      if (!ctrl.signal.aborted) { setError(e.message); setLoading(false) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load }
}

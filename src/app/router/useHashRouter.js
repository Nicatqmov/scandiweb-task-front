import { useCallback, useEffect, useState } from 'react'

function normalizePath(raw) {
  const path = String(raw || '')
  if (!path.startsWith('/')) return `/${path}`
  return path
}

function getHashPath() {
  const raw = window.location.hash.replace(/^#/, '')
  return normalizePath(raw)
}

export function useHashRouter() {
  const [path, setPath] = useState(() => getHashPath())

  useEffect(() => {
    function onHashChange() {
      setPath(getHashPath())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next) => {
    window.location.hash = normalizePath(next)
  }, [])

  const replace = useCallback((next) => {
    const normalized = normalizePath(next)
    const url = `${window.location.pathname}${window.location.search}#${normalized}`
    window.location.replace(url)
  }, [])

  return { path, navigate, replace }
}

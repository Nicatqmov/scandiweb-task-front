import { useEffect, useMemo } from 'react'
import Header from '../components/Header/Header.jsx'
import MiniCartOverlay from '../components/MiniCartOverlay/MiniCartOverlay.jsx'
import CategoryPage from '../pages/CategoryPage/CategoryPage.jsx'
import ProductPage from '../pages/ProductPage/ProductPage.jsx'
import { fetchCategories } from '../api/storeApi.js'
import { useStore } from '../state/store.jsx'
import { useHashRouter } from './router/useHashRouter.js'

function resolveRoute(path) {
  if (path === '' || path === '/') return { name: 'redirect' }

  const parts = path.split('/').filter(Boolean)

  if (parts[0] === 'product' && parts[1]) return { name: 'product', id: parts[1] }

  if (parts.length === 1) return { name: 'category', category: parts[0] }

  // Backwards-compatible: /category/:slug
  if (parts[0] === 'category' && parts[1] && parts.length === 2) return { name: 'category', category: parts[1] }

  return { name: 'notFound' }
}

export default function App() {
  const { path, navigate, replace } = useHashRouter()
  const route = useMemo(() => resolveRoute(path), [path])
  const { state, dispatch } = useStore()

  useEffect(() => {
    let cancelled = false

    async function load() {
      dispatch({ type: 'catalog/loading' })
      try {
        const cats = await fetchCategories()
        if (!cancelled) dispatch({ type: 'catalog/setCategories', payload: cats })
      } catch (e) {
        if (!cancelled) dispatch({ type: 'catalog/error', payload: e })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [dispatch])

  useEffect(() => {
    if (route.name === 'category') dispatch({ type: 'ui/setActiveCategory', payload: route.category })
  }, [route, dispatch])

  useEffect(() => {
    const cats = state.catalog.categories
    if (!cats?.length) return

    if (route.name === 'redirect') {
      replace(`/${cats[0].slug}`)
      return
    }

    if (route.name === 'category') {
      const exists = cats.some((c) => c.slug === route.category)
      if (!exists) replace(`/${cats[0].slug}`)
    }
  }, [route, replace, state.catalog.categories])

  const activeCategory = route.name === 'category' ? route.category : state.ui.activeCategory

  return (
    <div className="appShell">
      <Header activeCategory={activeCategory} onNavigate={navigate} />
      <main className="appMain">
        {route.name === 'category' && <CategoryPage category={route.category} onNavigate={navigate} />}
        {route.name === 'product' && <ProductPage id={route.id} />}
        {route.name === 'notFound' && (
          <div className="pageContainer">
            <h1 className="pageTitle">Not Found</h1>
          </div>
        )}
      </main>

      <MiniCartOverlay open={state.ui.miniCartOpen} />
    </div>
  )
}

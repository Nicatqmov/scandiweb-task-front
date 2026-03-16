import { useEffect, useMemo, useState } from 'react'
import { fetchCategoryByName } from '../../api/storeApi.js'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import { useStore } from '../../state/store.jsx'

function titleCase(input) {
  const str = String(input || '')
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function CategoryPage({ category, onNavigate }) {
  const { state } = useStore()

  const categoryName = useMemo(() => {
    const found = state.catalog.categories?.find((c) => c.slug === category)
    return found?.name || category
  }, [state.catalog.categories, category])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const cat = await fetchCategoryByName(categoryName)
        if (cancelled) return
        if (!cat) {
          setNotFound(true)
          setItems([])
          return
        }
        setItems(cat.products || [])
      } catch (e) {
        if (!cancelled) {
          setItems([])
          setError(e)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [categoryName])

  return (
    <div className="pageContainer">
      <h1 className="pageTitle">{titleCase(categoryName)}</h1>

      {loading && <p>Loading…</p>}
      {error && <p>Failed to load products: {String(error.message || error)}</p>}
      {notFound && <p>Category not found.</p>}

      {!loading && !error && !notFound && (
        <div className="productGrid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={(id) => onNavigate(`/product/${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

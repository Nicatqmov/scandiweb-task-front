import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CART_STORAGE_KEY = 'scandi_cart_v1'

function stableSerializeAttributes(attrs) {
  const keys = Object.keys(attrs || {}).sort()
  return keys.map((k) => `${k}:${attrs[k]}`).join('|')
}

function makeLineId(productId, selectedAttributes) {
  return `${productId}__${stableSerializeAttributes(selectedAttributes)}`
}

function loadCartFromStorage() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((l) => l && typeof l === 'object')
      .map((l) => {
        const productId = String(l.productId || l.product?.id || '')
        const qty = Number(l.qty || 0)
        const selectedAttributes = l.selectedAttributes && typeof l.selectedAttributes === 'object' ? l.selectedAttributes : {}
        const product = l.product && typeof l.product === 'object' ? l.product : null

        if (!productId || !Number.isFinite(qty) || qty <= 0) return null

        return {
          id: makeLineId(productId, selectedAttributes),
          productId,
          qty,
          selectedAttributes,
          product,
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function saveCartToStorage(cart) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // ignore
  }
}

const initialState = {
  cart: [],
  ui: {
    miniCartOpen: false,
    activeCategory: null,
  },
  catalog: {
    categories: null,
    loading: false,
    error: null,
  },
}

function init(state) {
  if (typeof window === 'undefined') return state
  return { ...state, cart: loadCartFromStorage() }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ui/toggleMiniCart':
      return { ...state, ui: { ...state.ui, miniCartOpen: !state.ui.miniCartOpen } }
    case 'ui/openMiniCart':
      return { ...state, ui: { ...state.ui, miniCartOpen: true } }
    case 'ui/closeMiniCart':
      return { ...state, ui: { ...state.ui, miniCartOpen: false } }
    case 'ui/setActiveCategory':
      return { ...state, ui: { ...state.ui, activeCategory: action.payload || null } }

    case 'catalog/loading':
      return { ...state, catalog: { ...state.catalog, loading: true, error: null } }
    case 'catalog/error':
      return { ...state, catalog: { ...state.catalog, loading: false, error: action.payload?.message || 'Failed' } }
    case 'catalog/setCategories':
      return { ...state, catalog: { categories: action.payload || [], loading: false, error: null } }

    case 'cart/addItem': {
      const product = action.payload?.product || null
      const productId = String(action.payload?.productId || product?.id || '')
      const selectedAttributes = action.payload?.selectedAttributes || {}
      if (!productId) return state

      const id = makeLineId(productId, selectedAttributes)
      const idx = state.cart.findIndex((l) => l.id === id)
      if (idx >= 0) {
        const next = state.cart.slice()
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return { ...state, cart: next }
      }
      return {
        ...state,
        cart: state.cart.concat([{ id, productId, product, selectedAttributes, qty: 1 }]),
      }
    }

    case 'cart/inc': {
      const id = action.payload.id
      return {
        ...state,
        cart: state.cart.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)),
      }
    }

    case 'cart/dec': {
      const id = action.payload.id
      const line = state.cart.find((l) => l.id === id)
      if (!line) return state
      if (line.qty <= 1) return { ...state, cart: state.cart.filter((l) => l.id !== id) }
      return {
        ...state,
        cart: state.cart.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l)),
      }
    }

    case 'cart/clear':
      return { ...state, cart: [] }

    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, init)

  useEffect(() => {
    if (typeof window === 'undefined') return
    saveCartToStorage(state.cart)
  }, [state.cart])

  useEffect(() => {
    document.body.classList.toggle('noScroll', state.ui.miniCartOpen)
  }, [state.ui.miniCartOpen])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function getCartQty(state) {
  return state.cart.reduce((sum, line) => sum + line.qty, 0)
}

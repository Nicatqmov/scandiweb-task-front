import { useEffect, useMemo, useRef, useState } from 'react'
import { placeOrder } from '../../api/storeApi.js'
import { getCartQty, useStore } from '../../state/store.jsx'
import { slugify } from '../../utils/slug.js'

function calcTotal(cart) {
  let sum = 0
  for (const line of cart) {
    const price = line.product?.prices?.[0]
    if (!price) continue
    sum += Number(price.amount) * line.qty
  }
  return sum
}

function pickCurrencySymbol(cart) {
  for (const line of cart || []) {
    const symbol = line?.product?.prices?.[0]?.currency?.symbol
    if (symbol) return String(symbol)
  }
  return '$'
}

function itemsLabel(qty) {
  return qty === 1 ? '1 Item' : `${qty} Items`
}

export default function MiniCartOverlay({ open }) {
  const { state, dispatch } = useStore()
  const panelRef = useRef(null)

  const qty = getCartQty(state)
  const total = useMemo(() => calcTotal(state.cart), [state.cart])
  const currencySymbol = useMemo(() => pickCurrencySymbol(state.cart), [state.cart])

  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    if (!open) {
      setOrdering(false)
      setOrderError('')
      return
    }

    function close() {
      dispatch({ type: 'ui/closeMiniCart' })
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') close()
    }

    function onPointerDown(e) {
      const panel = panelRef.current
      const target = e.target

      if (panel && target instanceof Node && panel.contains(target)) return
      if (target instanceof Element && target.closest('.cartButton')) return

      close()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, dispatch])

  async function onPlaceOrder() {
    setOrderError('')

    if (!state.cart.length) return

    setOrdering(true)
    try {
      const res = await placeOrder(state.cart)
      if (!res?.success) {
        setOrderError(res?.message || 'Failed to place order.')
        return
      }

      dispatch({ type: 'cart/clear' })
      dispatch({ type: 'ui/closeMiniCart' })
    } catch (e) {
      setOrderError(String(e.message || e))
    } finally {
      setOrdering(false)
    }
  }

  if (!open) return <div className="overlayRoot" />

  return (
    <div className={`overlayRoot ${open ? 'open' : ''}`}>
      <div className="overlayBackdrop" role="presentation" />

      <div ref={panelRef} className="miniCartPanel" role="dialog" aria-label="Mini cart">
        <p className="miniCartTitle">
          My Bag, <span>{itemsLabel(qty)}</span>
        </p>

        <div className="miniCartList">
          {state.cart.map((line) => {
            const product = line.product
            if (!product) return null

            const price = product.prices?.[0]
            const priceText = price ? `${price.currency.symbol}${Number(price.amount).toFixed(2)}` : ''

            return (
              <div key={line.id} className="miniCartItem">
                <div>
                  <p className="miniCartItemName">{product.name}</p>
                  <p className="miniCartItemPrice">{priceText}</p>

                  {(product.attributes || []).map((attr) => {
                    const attrKebab = slugify(attr.name)
                    const selected = line.selectedAttributes?.[attr.id]
                    if (!selected) return null

                    return (
                      <div key={attr.id} className="miniAttr" data-testid={`cart-item-attribute-${attrKebab}`}>
                        <p className="miniAttrLabel">{attr.name}:</p>
                        <div className="miniAttrOptions">
                          {attr.items.map((item) => {
                            const itemKebab = slugify(item.id)
                            const isActive = item.id === selected
                            const baseTestId = `cart-item-attribute-${attrKebab}-${itemKebab}`
                            const testId = isActive ? `${baseTestId}-selected` : baseTestId

                            if (attr.type === 'swatch') {
                              return (
                                <div
                                  key={item.id}
                                  className={`miniOptSwatch ${isActive ? 'miniOptSwatchActive' : ''}`}
                                  style={{ background: item.value }}
                                  data-testid={testId}
                                  aria-hidden
                                />
                              )
                            }

                            return (
                              <div
                                key={item.id}
                                className={`miniOptText ${isActive ? 'miniOptTextActive' : ''}`}
                                data-testid={testId}
                                aria-hidden
                              >
                                {item.displayValue}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="qtyCol" aria-label="Quantity controls">
                  <button
                    type="button"
                    className="qtyBtn"
                    data-testid="cart-item-amount-increase"
                    aria-label="Increase"
                    onClick={() => dispatch({ type: 'cart/inc', payload: { id: line.id } })}
                  >
                    +
                  </button>
                  <div className="qtyVal" data-testid="cart-item-amount">
                    {line.qty}
                  </div>
                  <button
                    type="button"
                    className="qtyBtn"
                    data-testid="cart-item-amount-decrease"
                    aria-label="Decrease"
                    onClick={() => dispatch({ type: 'cart/dec', payload: { id: line.id } })}
                  >
                    −
                  </button>
                </div>

                <img className="miniThumb" src={product.gallery?.[0]} alt="" loading="lazy" />
              </div>
            )
          })}
        </div>

        <div className="miniTotal" data-testid="cart-total">
          <span>Total</span>
          <span>
            {currencySymbol}
            {total.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          className="placeOrder"
          disabled={ordering || state.cart.length === 0}
          onClick={onPlaceOrder}
        >
          {ordering ? 'PLACING…' : 'PLACE ORDER'}
        </button>

        {orderError && <p style={{ margin: '12px 0 0', color: '#d64545', fontSize: 14 }}>{orderError}</p>}
      </div>
    </div>
  )
}

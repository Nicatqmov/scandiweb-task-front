import { useEffect, useMemo, useState } from 'react'
import { fetchProductById, formatFirstPrice } from '../../api/storeApi.js'
import AttributeSelector from '../../components/AttributeSelector/AttributeSelector.jsx'
import { ChevronLeft, ChevronRight } from '../../components/Icons/Icons.jsx'
import { useStore } from '../../state/store.jsx'
import { slugify } from '../../utils/slug.js'
import { useSafeHtml } from '../../utils/safeHtml.jsx'

function hasAllSelections(product, selected) {
  for (const attr of product?.attributes || []) {
    if (!selected?.[attr.id]) return false
  }
  return true
}

export default function ProductPage({ id }) {
  const { dispatch } = useStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [activeImage, setActiveImage] = useState(0)
  const [selected, setSelected] = useState({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const p = await fetchProductById(id)
        if (cancelled) return
        setProduct(p)
        setActiveImage(0)
        setSelected({})
      } catch (e) {
        if (!cancelled) {
          setProduct(null)
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
  }, [id])

  const priceText = useMemo(() => (product ? formatFirstPrice(product) : ''), [product])
  const images = product?.gallery || []
  const canArrows = images.length > 1

  const descriptionNodes = useSafeHtml(product?.description)

  function onChangeAttribute(attrId, itemId) {
    setSelected((prev) => ({ ...prev, [attrId]: itemId }))
  }

  if (loading) {
    return (
      <div className="pageContainer">
        <h1 className="pageTitle">Loading…</h1>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pageContainer">
        <h1 className="pageTitle">Not Found</h1>
        {error && <p>{String(error.message || error)}</p>}
      </div>
    )
  }

  const canAdd = product.inStock && (product.attributes?.length ? hasAllSelections(product, selected) : true)

  return (
    <div className="pageContainer">
      <div className="pdp" style={{ marginTop: 40 }}>
        <div className="pdpThumbs" aria-label="Product images">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              className="pdpThumbBtn"
              onClick={() => setActiveImage(idx)}
              aria-label={`Image ${idx + 1}`}
            >
              <img className="pdpThumbImg" src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>

        <div className="pdpMain" data-testid="product-gallery">
          <img className="pdpMainImg" src={images[activeImage]} alt={product.name} />
          {canArrows && (
            <>
              <button
                type="button"
                className="pdpArrow pdpArrowLeft"
                aria-label="Previous image"
                onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                className="pdpArrow pdpArrowRight"
                aria-label="Next image"
                onClick={() => setActiveImage((i) => (i + 1) % images.length)}
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>

        <div className="pdpInfo">
          <h1>{product.name}</h1>

          {(product.attributes || []).map((attr) => (
            <div key={attr.id} data-testid={`product-attribute-${slugify(attr.name)}`}>
              <AttributeSelector attribute={attr} value={selected[attr.id]} onChange={onChangeAttribute} />
            </div>
          ))}

          <div className="attrBlock">
            <p className="attrLabel">Price:</p>
            <p className="priceValue">{priceText}</p>
          </div>

          <button
            type="button"
            className="addToCart"
            data-testid="add-to-cart"
            disabled={!canAdd}
            onClick={() => {
              dispatch({
                type: 'cart/addItem',
                payload: { product, selectedAttributes: selected },
              })
              dispatch({ type: 'ui/openMiniCart' })
            }}
          >
            ADD TO CART
          </button>

          <div className="pdpDesc" data-testid="product-description">
            {descriptionNodes}
          </div>
        </div>
      </div>
    </div>
  )
}

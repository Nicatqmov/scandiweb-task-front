import { formatFirstPrice, pickDefaultAttributes } from '../../api/storeApi.js'
import { slugify } from '../../utils/slug.js'
import { CartIcon } from '../Icons/Icons.jsx'
import { useStore } from '../../state/store.jsx'

export default function ProductCard({ product, onOpen }) {
  const { dispatch } = useStore()

  const priceText = formatFirstPrice(product)
  const kebabName = slugify(product.name)

  return (
    <div
      className={`productCard ${product.inStock ? '' : 'productOut'}`}
      role="button"
      tabIndex={0}
      data-testid={`product-${kebabName}`}
      onClick={() => onOpen(product.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(product.id)
      }}
    >
      <div className="productImageWrap">
        <img className="productImage" src={product.gallery?.[0]} alt={product.name} loading="lazy" />
        {!product.inStock && <div className="outOfStockLabel">OUT OF STOCK</div>}
      </div>

      {product.inStock && (
        <button
          type="button"
          className="fabCart"
          aria-label="Add to cart"
          onClick={(e) => {
            e.stopPropagation()
            dispatch({
              type: 'cart/addItem',
              payload: { product, selectedAttributes: pickDefaultAttributes(product) },
            })
            dispatch({ type: 'ui/openMiniCart' })
          }}
        >
          <CartIcon color="#fff" />
        </button>
      )}

      <div className="productMeta">
        <p className="productName">{product.name}</p>
        <p className="productPrice">{priceText}</p>
      </div>
    </div>
  )
}

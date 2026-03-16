import { getCartQty, useStore } from '../../state/store.jsx'
import { BrandBagIcon, CartIcon } from '../Icons/Icons.jsx'

export default function Header({ activeCategory, onNavigate }) {
  const { state, dispatch } = useStore()
  const qty = getCartQty(state)

  const navCategories = state.catalog.categories || []

  return (
    <header className="header">
      <div className="headerInner">
        <nav className="navCategories" aria-label="Categories">
          {navCategories.map((c) => {
            const isActive = c.slug === activeCategory
            return (
              <a
                key={c.slug}
                className={`navLink ${isActive ? 'navLinkActive' : ''}`}
                href={`#/${c.slug}`}
                data-testid={isActive ? 'active-category-link' : 'category-link'}
                onClick={(e) => {
                  e.preventDefault()
                  dispatch({ type: 'ui/closeMiniCart' })
                  onNavigate(`/${c.slug}`)
                }}
              >
                {String(c.name).toUpperCase()}
              </a>
            )
          })}
        </nav>

        <a
          className="brandMark"
          aria-label="Home"
          href={`#/${activeCategory || navCategories[0]?.slug || ''}`}
          onClick={(e) => {
            e.preventDefault()
            const to = `/${activeCategory || navCategories[0]?.slug || ''}`
            if (to !== '/') {
              dispatch({ type: 'ui/closeMiniCart' })
              onNavigate(to)
            }
          }}
        >
          <BrandBagIcon />
        </a>

        <div className="headerRight">
          <button
            type="button"
            className="cartButton"
            aria-label="Cart"
            data-testid="cart-btn"
            onClick={() => dispatch({ type: 'ui/toggleMiniCart' })}
          >
            <CartIcon />
            {qty > 0 && <span className="cartCountBadge">{qty}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}

import { slugify } from '../../utils/slug.js'

export default function AttributeSelector({ attribute, value, onChange }) {
  const attrKebab = slugify(attribute?.name)

  return (
    <div className="attrBlock">
      <p className="attrLabel">{attribute.name}:</p>
      <div className="attrOptions">
        {attribute.items.map((item) => {
          const isActive = item.id === value
          const itemKebab = slugify(item.id)
          const baseTestId = `product-attribute-${attrKebab}-${itemKebab}`
          const testId = isActive ? `${baseTestId}-selected` : baseTestId

          if (attribute.type === 'swatch') {
            return (
              <button
                key={item.id}
                type="button"
                className={`optionSwatch ${isActive ? 'optionSwatchActive' : ''}`}
                style={{ background: item.value }}
                data-testid={testId}
                aria-label={item.displayValue}
                onClick={() => onChange(attribute.id, item.id)}
              />
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`optionText ${isActive ? 'optionTextActive' : ''}`}
              data-testid={testId}
              onClick={() => onChange(attribute.id, item.id)}
            >
              {item.displayValue}
            </button>
          )
        })}
      </div>
    </div>
  )
}

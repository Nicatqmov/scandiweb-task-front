import { graphqlRequest } from './graphql.js'
import { slugify } from '../utils/slug.js'

export async function fetchCategories() {
  const data = await graphqlRequest(`
    query Categories {
      categories {
        name
      }
    }
  `)

  const list = data?.categories || []
  return list.map((c) => ({ name: c.name, slug: slugify(c.name) }))
}

export async function fetchCategoryByName(name) {
  const data = await graphqlRequest(
    `
    query Category($name: String!) {
      category(name: $name) {
        name
        products {
          id
          name
          inStock
          gallery
          attributes {
            id
            name
            type
            items { id displayValue value }
          }
          prices { amount currency { label symbol } }
          brand
          description
          category
        }
      }
    }
  `,
    { name }
  )

  return data?.category || null
}

export async function fetchProductById(id) {
  const data = await graphqlRequest(
    `
    query Product($id: String!) {
      product(id: $id) {
        id
        name
        inStock
        gallery
        description
        category
        brand
        attributes {
          id
          name
          type
          items { id displayValue value }
        }
        prices { amount currency { label symbol } }
      }
    }
  `,
    { id }
  )

  return data?.product || null
}

export async function placeOrder(cartLines) {
  const items = (cartLines || []).map((line) => {
    const selectedAttributesObj = line.selectedAttributes || {}
    const selectedAttributes = Object.entries(selectedAttributesObj).map(([id, itemId]) => ({ id, itemId }))

    return {
      productId: String(line.productId || line.product?.id || ''),
      qty: Number(line.qty || 0),
      selectedAttributes,
    }
  })

  const data = await graphqlRequest(
    `
    mutation PlaceOrder($items: [OrderItemInput!]!) {
      placeOrder(items: $items) {
        success
        message
      }
    }
  `,
    { items }
  )

  return data?.placeOrder
}

export function pickDefaultAttributes(product) {
  const defaults = {}
  for (const attr of product?.attributes || []) {
    if (attr.items?.length) defaults[attr.id] = attr.items[0].id
  }
  return defaults
}

export function formatFirstPrice(product) {
  const price = product?.prices?.[0]
  if (!price) return ''
  return `${price.currency.symbol}${Number(price.amount).toFixed(2)}`
}

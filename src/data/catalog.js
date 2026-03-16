export const categories = [
  { slug: 'women', label: 'Women' },
  { slug: 'men', label: 'Men' },
  { slug: 'kids', label: 'Kids' },
]

const USD = { label: 'USD', symbol: '$' }

export const products = [
  {
    id: 'running-short',
    name: 'Running Short',
    category: 'women',
    inStock: true,
    gallery: [
      'https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1576016105/product-image/2409L_61.jpg',
      'https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1576016107/product-image/2409L_61_a.jpg',
      'https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1576016108/product-image/2409L_61_b.jpg',
      'https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1576016109/product-image/2409L_61_c.jpg',
    ],
    description:
      "Find stunning women's cocktail dresses and party dresses. Stand out in lace and metallic cocktail dresses and party dresses from all your favorite brands.",
    attributes: [
      {
        id: 'Size',
        name: 'Size',
        type: 'text',
        items: [
          { id: 'XS', displayValue: 'XS', value: 'XS' },
          { id: 'S', displayValue: 'S', value: 'S' },
          { id: 'M', displayValue: 'M', value: 'M' },
          { id: 'L', displayValue: 'L', value: 'L' },
        ],
      },
      {
        id: 'Color',
        name: 'Color',
        type: 'swatch',
        items: [
          { id: 'Gray', displayValue: 'Gray', value: '#D3D2D5' },
          { id: 'Black', displayValue: 'Black', value: '#2B2B2B' },
          { id: 'Green', displayValue: 'Green', value: '#0A6453' },
        ],
      },
    ],
    prices: [{ currency: USD, amount: 50.0 }],
  },
  {
    id: 'wayfarer',
    name: 'Wayfarer',
    category: 'women',
    inStock: true,
    gallery: [
      'https://cdn.shopify.com/s/files/1/0087/6193/3920/products/DD1381200_DEOA_1_720x.jpg?v=1612816087',
    ],
    description: 'Lightweight sunglasses with a classic shape.',
    attributes: [
      {
        id: 'Size',
        name: 'Size',
        type: 'text',
        items: [
          { id: 'S', displayValue: 'S', value: 'S' },
          { id: 'M', displayValue: 'M', value: 'M' },
        ],
      },
      {
        id: 'Color',
        name: 'Color',
        type: 'swatch',
        items: [
          { id: 'Black', displayValue: 'Black', value: '#000000' },
          { id: 'Blue', displayValue: 'Blue', value: '#15A4C7' },
          { id: 'Orange', displayValue: 'Orange', value: '#F68422' },
        ],
      },
    ],
    prices: [{ currency: USD, amount: 75.0 }],
  },
  {
    id: 'ap-pro',
    name: 'AirPods Pro',
    category: 'women',
    inStock: false,
    gallery: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MWP22?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1591634795000'],
    description: 'Active Noise Cancellation and Transparency mode.',
    attributes: [],
    prices: [{ currency: USD, amount: 50.0 }],
  },
  {
    id: 'huarache',
    name: 'Nike Air Huarache Le',
    category: 'men',
    inStock: true,
    gallery: [
      'https://cdn.shopify.com/s/files/1/0087/6193/3920/products/DD1381200_DEOA_2_720x.jpg?v=1612816087',
      'https://cdn.shopify.com/s/files/1/0087/6193/3920/products/DD1381200_DEOA_3_720x.jpg?v=1612816087',
    ],
    description: 'Great sneakers for everyday use!',
    attributes: [
      {
        id: 'Size',
        name: 'Size',
        type: 'text',
        items: [
          { id: '40', displayValue: '40', value: '40' },
          { id: '41', displayValue: '41', value: '41' },
          { id: '42', displayValue: '42', value: '42' },
          { id: '43', displayValue: '43', value: '43' },
        ],
      },
    ],
    prices: [{ currency: USD, amount: 144.69 }],
  },
  {
    id: 'ps5',
    name: 'PlayStation 5',
    category: 'kids',
    inStock: true,
    gallery: [
      'https://m.media-amazon.com/images/I/619BkvKW35L._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71Xq4t2w6JL._SL1500_.jpg',
    ],
    description: 'Play has no limits.',
    attributes: [
      {
        id: 'Color',
        name: 'Color',
        type: 'swatch',
        items: [
          { id: 'White', displayValue: 'White', value: '#FFFFFF' },
          { id: 'Black', displayValue: 'Black', value: '#1D1F22' },
        ],
      },
    ],
    prices: [{ currency: USD, amount: 499.99 }],
  },
]

export function getProductById(id) {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category) {
  return products.filter((p) => p.category === category)
}

export function formatPrice(product) {
  const price = product.prices?.[0]
  if (!price) return ''
  return `${price.currency.symbol}${price.amount.toFixed(2)}`
}

export function getDefaultAttributes(product) {
  const defaults = {}
  for (const attr of product.attributes || []) {
    if (attr.items?.length) defaults[attr.id] = attr.items[0].id
  }
  return defaults
}

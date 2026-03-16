import { useMemo } from 'react'

const ALLOWED_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'br', 'a'])

function textOf(node) {
  return node?.textContent || ''
}

function normalizeUrl(url) {
  try {
    const u = new URL(url, window.location.origin)
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString()
    return null
  } catch {
    return null
  }
}

function nodeToReact(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const el = node
  const tag = el.tagName.toLowerCase()

  if (!ALLOWED_TAGS.has(tag)) {
    // Strip unknown tags but keep their text.
    return textOf(el)
  }

  if (tag === 'br') return <br key={key} />

  const children = Array.from(el.childNodes)
    .map((c, idx) => nodeToReact(c, `${key}-${idx}`))
    .filter((c) => c !== null && c !== undefined)

  if (tag === 'a') {
    const href = normalizeUrl(el.getAttribute('href') || '')
    return (
      <a key={key} href={href || '#'} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    )
  }

  const mappedTag = tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag
  const Tag = mappedTag
  return <Tag key={key}>{children}</Tag>
}

export function useSafeHtml(html) {
  return useMemo(() => {
    const raw = String(html || '')
    if (!raw) return null

    // DOMParser exists in the browser; on server, just return plain text.
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return raw

    const doc = new DOMParser().parseFromString(raw, 'text/html')
    const nodes = Array.from(doc.body.childNodes)

    return nodes.map((n, idx) => nodeToReact(n, `n-${idx}`))
  }, [html])
}

const DEFAULT_URL = 'https://nicat-qasimov.kesug.com/graphql'

export function getGraphqlUrl() {
  return import.meta.env?.VITE_GRAPHQL_URL || DEFAULT_URL
}

export async function graphqlRequest(query, variables) {
  const res = await fetch(getGraphqlUrl(), {
    method: 'POST',
    headers: {
      // Use a "simple" request Content-Type to avoid CORS preflight (OPTIONS),
      // which some shared hosts/WAFs block. Backend still parses JSON from body.
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }

  if (json?.errors?.length) {
    throw new Error(json.errors[0].message || 'GraphQL error')
  }

  return json?.data
}

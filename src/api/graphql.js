const DEFAULT_URL = 'http://nicat-qasimov.kesug.com/graphql'

export function getGraphqlUrl() {
  return import.meta.env?.VITE_GRAPHQL_URL || DEFAULT_URL
}

export async function graphqlRequest(query, variables) {
  const res = await fetch(getGraphqlUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

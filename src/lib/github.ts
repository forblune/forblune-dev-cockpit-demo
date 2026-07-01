import { graphql } from '@octokit/graphql'

/**
 * A GraphQL client bound to the user's fine-grained PAT.
 * The token is read from the store and sent ONLY to api.github.com.
 */
export function githubClient(token: string) {
  return graphql.defaults({
    headers: { authorization: `bearer ${token}` },
  })
}

export type GithubClient = ReturnType<typeof githubClient>

/** Validate a PAT by fetching the viewer login; throws on an invalid/expired token. */
export async function validateToken(token: string): Promise<string> {
  const client = githubClient(token)
  const res = await client<{ viewer: { login: string } }>('query { viewer { login } }')
  return res.viewer.login
}

/**
 * One batched query: viewer + the user's open PRs + PRs awaiting their review,
 * each with the latest commit's CI rollup. Repo scope is applied via the search
 * query strings (e.g. "repo:owner/name") built in the hook.
 */
export const PULSE_QUERY = `
query Pulse($mine: String!, $reviewing: String!) {
  viewer { login }
  mine: search(query: $mine, type: ISSUE, first: 20) {
    nodes { ...prFields }
  }
  reviewing: search(query: $reviewing, type: ISSUE, first: 20) {
    nodes { ...prFields }
  }
}
fragment prFields on PullRequest {
  id
  number
  title
  url
  isDraft
  updatedAt
  headRefName
  repository { nameWithOwner }
  commits(last: 1) {
    nodes {
      commit {
        statusCheckRollup { state }
      }
    }
  }
}
`

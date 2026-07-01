# AI Dev Cockpit Demo

A public demo dashboard for an AI-assisted development cockpit.

This repository contains a static, demo-safe version of a cockpit UI that helps answer three questions:

- What is the current mission?
- What is the next useful action?
- What needs attention?

The app uses local demo data only. It does not include private infrastructure details, real server endpoints, personal logs, API keys, or operational runbooks.

## Demo Sections

- Overview: current mission, next action, and attention summary.
- Workflow: demo workflow band, system map, and pipeline view.
- Infra: demo service status and edge-device readiness.
- Agents: demo agent work and usage summary.
- Settings: local UI preferences and demo-only controls.

## Development

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## GitHub Pages

The Vite base path is configured for:

```text
/forblune-dev-cockpit-demo/
```

When deployed from GitHub Pages, the expected URL is:

```text
https://forblune.github.io/forblune-dev-cockpit-demo/
```

## Privacy

This demo intentionally avoids:

- real LAN addresses
- real device or server names
- private project names
- internal API routes
- API keys, tokens, or secrets
- personal development logs

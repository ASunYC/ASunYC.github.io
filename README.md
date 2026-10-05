# ASunYC.github.io

![VitePress](https://img.shields.io/badge/site-VitePress-blue.svg) ![Vue](https://img.shields.io/badge/Vue-3-green.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

The source for [ASunYC's project hub](https://asunyc.github.io/). This VitePress site brings together project guides, agent skill discovery pages, and interactive experiments.

## Pages and projects

| Page | What it covers |
| --- | --- |
| [Home](https://asunyc.github.io/) | Featured projects and entry points. |
| [Skills Book](https://asunyc.github.io/skills-book/) | Agent skill marketplace, CLI usage, and recommended skill combinations. |
| [Skills Hot](https://asunyc.github.io/skills-hot/) | Popular and recently active skills from Skills Book data. |
| [Skills Shop](https://asunyc.github.io/skills-shop/) | Interactive skill map and detailed skill pages. |
| [Agent Switch](https://asunyc.github.io/agent-switch/) | Guide to the [Agent Switch CLI and skill](https://github.com/ASunYC/agent-switch-skill). |
| [OpenAgentSeal](https://asunyc.github.io/open-agent-seal/) | Guide to the [OpenAgentSeal assistant](https://github.com/ASunYC/OpenAgentSeal). |
| [Hermes Kanban](https://asunyc.github.io/kanban) | Project guide for the Hermes workflow dashboard; its [separate demo](https://asunyc.github.io/hermes-kanban/) has static data. |
| [MapNews](https://asunyc.github.io/map-news/) | News globe with static data and optional platform features. |

The project guides for Agent Switch, OpenAgentSeal, and Hermes Kanban live in this site. Their applications and release workflows are maintained separately.

## Develop locally

Use Node.js 22 or newer, as in the [deployment workflow](.github/workflows/deploy.yml).

```bash
npm ci
npm run dev
```

VitePress serves the site locally and reloads pages as they change. To check the production output:

```bash
npm run build
npm run preview
```

The build writes static files to `dist/`. Pushes to `master` trigger the GitHub Actions deployment to GitHub Pages.

## Data and optional services

- Skills Book exports discovery data into `docs/public/data/`. The `skills-book:hot-top` script generates the list displayed on Skills Hot.
- MapNews includes static fallback data at `docs/public/data/map-news/news.json`.
- To enable supported platform features locally, copy `.env.example` to `.env` and set the relevant `VITE_*` values. The Supabase service role key is for the server-side import script only; never put it in a browser-facing variable.
- `npm run mapnews:import-submissions` is the separate server-side import command for MapNews submissions.

Site pages and Vue components are in `docs/`; shared VitePress configuration is in `docs/.vitepress/`.

## Updating Skills data

The [refresh workflow](.github/workflows/refresh-skills-data.yml) checks out this site beside `skills-book`, fetches the latest index, builds the wiki, exports static data into `docs/public/data/`, and regenerates the Skills Hot top list. It commits that data only when files change. The workflow can also be started manually from GitHub Actions.

For a local refresh with the two repositories as sibling directories, use Node.js 22 or newer and run the same commands in order:

```bash
cd ../skills-book
npm ci
node scripts/skills-book.mjs fetch --force
node scripts/skills-book.mjs build-wiki
node scripts/skills-book.mjs shop-export ../ASunYC.github.io/docs/public/data
cd ../ASunYC.github.io
node scripts/generate-skills-book-hot-top.mjs
```

Review the generated data diff before committing. The site build reads the files already present in `docs/public/data/`; building alone does not refresh the external skills index.

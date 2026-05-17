export interface FeatureItem {
  iconSvg: string
  title: string
  desc: string
  command?: string
}

export interface FeatureSection {
  title: string
  items: FeatureItem[]
}

export interface CliSupportItem {
  name: string
  logo: string
  mark: string
  status: string
  desc: string
}

export interface QuickUseStep {
  title: string
  desc: string
  code?: string
}

export interface ComboComponent {
  name: string
  type: string
  install: string
  description: string
  why?: string
  notes?: string[]
}

export interface RecommendedCombo {
  id: string
  title: string
  category: string
  categoryName: string
  summary: string
  audience?: string
  slug?: string
  tags?: string[]
  useCases?: string[]
  components: ComboComponent[]
  workflow?: string[]
  prompt?: string
}

// SVG icon helpers
const icons = {
  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  merge: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  database: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  key: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  terminal: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  package: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
}

export const CLI_SUPPORT: CliSupportItem[] = [
  {
    name: 'Claude Code',
    logo: 'Claude Code',
    mark: 'C',
    status: 'Default target',
    desc: 'Install Skills Book as a Claude Code skill and let Claude run search, browse, install, and update commands.',
  },
  {
    name: 'OpenAI Codex',
    logo: 'OpenAI Codex',
    mark: 'AI',
    status: 'SKILL.md compatible',
    desc: 'Use the same skill package in Codex-compatible skill directories and run the Node CLI from the workspace.',
  },
  {
    name: 'OpenCode',
    logo: 'OpenCode',
    mark: 'OC',
    status: 'SKILL.md compatible',
    desc: 'Load the skill instructions, then ask OpenCode to search the index or install a selected skill.',
  },
  {
    name: 'Gemini CLI',
    logo: 'Gemini',
    mark: 'G',
    status: 'Agent compatible',
    desc: 'Works as an instruction-plus-command package for Gemini CLI style agent workflows.',
  },
  {
    name: 'Cursor',
    logo: 'Cursor',
    mark: 'Cu',
    status: 'Agent compatible',
    desc: 'Keep the repository in your agent context and call the zero-dependency CLI for discovery and install tasks.',
  },
  {
    name: 'Windsurf',
    logo: 'Windsurf',
    mark: 'W',
    status: 'Agent compatible',
    desc: 'Use Skills Book as a local project utility for browsing agent skills and copying install commands.',
  },
  {
    name: 'Cline',
    logo: 'Cline',
    mark: 'Cl',
    status: 'Agent compatible',
    desc: 'Expose the SKILL.md and scripts folder to Cline so it can operate the marketplace commands.',
  },
  {
    name: 'Roo Code',
    logo: 'Roo Code',
    mark: 'R',
    status: 'Agent compatible',
    desc: 'Use the CLI directly from the repository or mirror the skill into Roo-compatible project memory.',
  },
]

export const QUICK_USE_STEPS: QuickUseStep[] = [
  {
    title: 'Install Skills Book into Claude Code',
    desc: 'Clone the repository and copy it into Claude Code skills directory.',
    code: `git clone https://github.com/ASunYC/skills-book.git
cd skills-book
cp -r . ~/.claude/skills/skills-book`,
  },
  {
    title: 'Verify the CLI',
    desc: 'Confirm Node.js 22+ can run the zero-dependency script.',
    code: 'node ~/.claude/skills/skills-book/scripts/skills-book.mjs help',
  },
  {
    title: 'Ask Claude Code to use it',
    desc: 'Claude Code can now invoke Skills Book when you ask for skill discovery or installation.',
    code: 'Use skills-book to search for testing skills, show the top results, and install the best fit.',
  },
]

export const RECOMMENDED_COMBOS: RecommendedCombo[] = [
  {
    id: 'coding-research-docs-ui',
    title: 'Coding Research Stack',
    category: 'coding',
    categoryName: 'Coding',
    summary: 'A practical stack for coding tasks that need fresh web research, current official docs, and polished frontend delivery.',
    audience: 'Claude Code, Codex, OpenCode, and other agent CLI users',
    tags: ['research', 'docs', 'frontend', 'implementation', 'current APIs'],
    useCases: [
      'Fast-moving libraries or SDKs where stale API syntax is risky.',
      'Feature work that includes a visible UI and needs a final polish pass.',
      'Technical research before implementation.',
    ],
    components: [
      {
        name: 'Firecrawl',
        type: 'Tool',
        install: 'npx -y firecrawl-cli@latest init --all --browser',
        description: 'Web search and crawling for collecting the latest technical context, product notes, and API changes before implementation.',
        why: 'Useful for fast-moving APIs, product announcements, migration guides, and third-party references.',
      },
      {
        name: 'Context7',
        type: 'Tool',
        install: 'npx ctx7@latest setup',
        description: 'Documentation lookup for current official framework, SDK, and library guidance.',
        why: 'Helps confirm modern usage for React, Next.js, Tailwind, Prisma, OpenAI SDK, and other dependencies before coding.',
      },
      {
        name: 'UI UX Pro Max',
        type: 'Skill',
        install: 'npm install -g uipro-cli\nuipro init --ai codex # Codex CLI',
        description: 'Frontend experience and visual quality skill pack for turning working screens into stronger product interfaces.',
        why: 'Helps reduce template-like layouts, random card piles, overused emoji, and flat color systems.',
      },
    ],
    workflow: [
      'Use Firecrawl to gather fresh background, announcements, and unstructured web context.',
      'Use Context7 to confirm official API, configuration, and version-specific guidance.',
      'Use UI UX Pro Max to improve interaction quality, visual hierarchy, and responsive polish.',
    ],
    prompt: 'I am working on a coding task. Please use Firecrawl for fresh research, Context7 for official documentation, and UI UX Pro Max to refine the frontend experience.',
  },
]

export const FEATURE_DATA: FeatureSection[] = [
  {
    title: 'Core Capabilities',
    items: [
      {
        iconSvg: icons.layers,
        title: 'Multi-Source Aggregation',
        desc: 'Pull from VoltAgent + heilcheng repositories, 1500+ skills in one search',
      },
      {
        iconSvg: icons.search,
        title: 'Real-Time Discovery',
        desc: 'Search by topic, SKILL.md filename, or keywords across GitHub',
      },
      {
        iconSvg: icons.merge,
        title: 'Smart Deduplication',
        desc: 'Deduplicate by owner/repo, merge categories automatically',
      },
      {
        iconSvg: icons.star,
        title: 'Stars Ranking',
        desc: 'Sort by GitHub stars, updated in real-time',
      },
      {
        iconSvg: icons.zap,
        title: 'One-Click Install/Uninstall',
        desc: 'Auto-clone skills to Claude Code directory, safe removal',
      },
      {
        iconSvg: icons.database,
        title: 'Persistent Cache',
        desc: 'Manually added skills persist across refreshes, auto-expire updates',
      },
    ],
  },
  {
    title: 'Technical Highlights',
    items: [
      {
        iconSvg: icons.cpu,
        title: 'Zero External Dependencies',
        desc: 'Pure Node.js 22+ native fetch API, no npm install needed',
      },
      {
        iconSvg: icons.shield,
        title: 'Auto Proxy Fallback',
        desc: 'Auto-detect GitHub connectivity, switch to gh-proxy for restricted networks',
      },
      {
        iconSvg: icons.key,
        title: 'API Rate Protection',
        desc: '60 req/hr unauthenticated, 5000 req/hr with GITHUB_TOKEN',
      },
      {
        iconSvg: icons.grid,
        title: 'Modular Design',
        desc: 'Clean module separation, easy to extend with new data sources',
      },
    ],
  },
  {
    title: 'Common Commands',
    items: [
      {
        iconSvg: icons.download,
        title: 'Fetch Index',
        desc: 'Initial setup — pull and cache skills from source repos',
        command: 'skills-book fetch --force',
      },
      {
        iconSvg: icons.terminal,
        title: 'Browse Categories',
        desc: 'List all categories with skill counts',
        command: 'skills-book categories',
      },
      {
        iconSvg: icons.search,
        title: 'Search Skills',
        desc: 'Search by keyword across names, descriptions, categories',
        command: 'skills-book search "testing"',
      },
      {
        iconSvg: icons.star,
        title: 'Top Skills',
        desc: 'Most popular skills ranked by GitHub stars',
        command: 'skills-book top 10',
      },
      {
        iconSvg: icons.package,
        title: 'Install Skill',
        desc: 'Auto-clone a skill to Claude Code directory',
        command: 'skills-book install "owner/name"',
      },
      {
        iconSvg: icons.trash,
        title: 'Uninstall Skill',
        desc: 'Safely remove an installed skill',
        command: 'skills-book uninstall "name"',
      },
    ],
  },
]

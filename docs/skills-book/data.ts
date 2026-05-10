export interface FeatureItem {
  icon: string
  title: string
  desc: string
  command?: string
}

export interface FeatureSection {
  title: string
  items: FeatureItem[]
}

export const FEATURE_DATA: FeatureSection[] = [
  {
    title: 'Core Capabilities',
    items: [
      {
        icon: '📦',
        title: 'Multi-Source Aggregation',
        desc: 'Pull from VoltAgent + heilcheng repositories, 1500+ skills in one search',
      },
      {
        icon: '🔍',
        title: 'Real-Time Discovery',
        desc: 'Search by topic, SKILL.md filename, or keywords across GitHub',
      },
      {
        icon: '🔄',
        title: 'Smart Deduplication',
        desc: 'Deduplicate by owner/repo, merge categories automatically',
      },
      {
        icon: '⭐',
        title: 'Stars Ranking',
        desc: 'Sort by GitHub stars, updated in real-time',
      },
      {
        icon: '🚀',
        title: 'One-Click Install/Uninstall',
        desc: 'Auto-clone skills to Claude Code directory, safe removal',
      },
      {
        icon: '💾',
        title: 'Persistent Cache',
        desc: 'Manually added skills persist across refreshes, auto-expire updates',
      },
    ],
  },
  {
    title: 'Technical Highlights',
    items: [
      {
        icon: '⚡',
        title: 'Zero External Dependencies',
        desc: 'Pure Node.js 22+ native fetch API, no npm install needed',
      },
      {
        icon: '🌐',
        title: 'Auto Proxy Fallback',
        desc: 'Auto-detect GitHub connectivity, switch to gh-proxy for restricted networks',
      },
      {
        icon: '🔑',
        title: 'API Rate Protection',
        desc: '60 req/hr unauthenticated, 5000 req/hr with GITHUB_TOKEN',
      },
      {
        icon: '🧩',
        title: 'Modular Design',
        desc: 'Clean module separation, easy to extend with new data sources',
      },
    ],
  },
  {
    title: 'Common Commands',
    items: [
      {
        icon: '📥',
        title: 'Fetch Index',
        desc: 'Initial setup — pull and cache skills from source repos',
        command: 'skills-book fetch --force',
      },
      {
        icon: '📂',
        title: 'Browse Categories',
        desc: 'List all categories with skill counts',
        command: 'skills-book categories',
      },
      {
        icon: '🔎',
        title: 'Search Skills',
        desc: 'Search by keyword across names, descriptions, categories',
        command: 'skills-book search "testing"',
      },
      {
        icon: '🏆',
        title: 'Top Skills',
        desc: 'Most popular skills ranked by GitHub stars',
        command: 'skills-book top 10',
      },
      {
        icon: '📦',
        title: 'Install Skill',
        desc: 'Auto-clone a skill to Claude Code directory',
        command: 'skills-book install "owner/name"',
      },
      {
        icon: '🗑️',
        title: 'Uninstall Skill',
        desc: 'Safely remove an installed skill',
        command: 'skills-book uninstall "name"',
      },
    ],
  },
]

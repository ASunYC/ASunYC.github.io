import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const ROOT = process.cwd()
const OUTPUT_FILE = path.join(ROOT, 'docs/public/data/skills-book/hot-top.json')
const GRAPH_FILE = path.join(ROOT, 'docs/public/data/skills-shop/graph.json')
const SKILLS_CACHE_FILE = path.join(homedir(), '.claude/skills-book/cache/skills-index.json')
const BASELINE_PATH = 'docs/public/data/skills-shop/graph.json'

function slugify(value) {
  return String(value || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled'
}

function skillSlug(skill) {
  return slugify(`${skill.owner || 'unknown'}-${skill.name || skill.display_name}`)
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function readCurrentSkills() {
  if (existsSync(SKILLS_CACHE_FILE)) {
    const cache = readJson(SKILLS_CACHE_FILE)
    return Object.values(cache.skills || {})
      .filter((skill) => Number(skill.stars || 0) > 0)
      .map((skill) => ({
        slug: skillSlug(skill),
        displayName: skill.display_name || `${skill.owner}/${skill.name}`,
        description: skill.description || '',
        category: skill.category || 'Uncategorized',
        stars: Number(skill.stars || 0),
        githubRepo: skill.github_repo || null,
        source: skill.source || null,
      }))
  }

  const graph = readJson(GRAPH_FILE)
  return (graph.nodes || [])
    .filter((node) => node.type === 'skill' && Number(node.stars || 0) > 0)
    .map((node) => ({
      slug: node.slug,
      displayName: node.name,
      description: '',
      category: node.category || 'Uncategorized',
      stars: Number(node.stars || 0),
      githubRepo: null,
      source: 'skills-shop-graph',
    }))
}

function readBaselineStars() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  let baselineText = null
  let baselineCommit = null

  try {
    const commits = execSync(`git log --since="${since}" --format=%H --reverse -- ${BASELINE_PATH}`, {
      cwd: ROOT,
      encoding: 'utf8',
    })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)

    baselineCommit = commits[0] || null
    if (baselineCommit) {
      baselineText = execSync(`git show ${baselineCommit}:${BASELINE_PATH}`, {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 96 * 1024 * 1024,
      })
    }
  } catch {
    baselineText = null
  }

  if (!baselineText && existsSync(GRAPH_FILE)) {
    baselineText = readFileSync(GRAPH_FILE, 'utf8')
    baselineCommit = 'working-tree'
  }

  const bySlug = new Map()
  if (!baselineText) return { bySlug, baselineCommit }

  const graph = JSON.parse(baselineText)
  for (const node of graph.nodes || []) {
    if (node.type === 'skill' && node.slug) {
      bySlug.set(node.slug, Number(node.stars || 0))
    }
  }
  return { bySlug, baselineCommit }
}

const current = readCurrentSkills()
const { bySlug: baselineStars, baselineCommit } = readBaselineStars()

const topSkills = current
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 10)

const baselineByRepo = new Map()
for (const skill of topSkills) {
  if (!skill.githubRepo || baselineByRepo.has(skill.githubRepo)) continue
  const baseline = baselineStars.get(skill.slug)
  if (baseline != null) baselineByRepo.set(skill.githubRepo, baseline)
}

const skills = topSkills
  .map((skill, index) => {
    const baseline = baselineStars.get(skill.slug) ?? baselineByRepo.get(skill.githubRepo)
    const weeklyStars = Math.max(0, skill.stars - Number(baseline ?? skill.stars))
    return {
      rank: index + 1,
      ...skill,
      weeklyStars,
      href: `/skills-shop/${skill.slug}/`,
    }
  })

const output = {
  generatedAt: new Date().toISOString(),
  source: existsSync(SKILLS_CACHE_FILE) ? 'local-skills-cache' : 'skills-shop-graph',
  baseline: {
    window: '7d',
    commit: baselineCommit,
  },
  skills,
}

mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

console.log(`Wrote ${path.relative(ROOT, OUTPUT_FILE)} with ${skills.length} rows.`)

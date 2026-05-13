import type { User } from '@supabase/supabase-js'
import { getCurrentUser, getSupabaseClient, githubLogin } from './supabase'

export interface PlatformComment {
  id: string
  body: string
  created_at: string
  status?: string
  profiles?: {
    github_login?: string
    display_name?: string
    avatar_url?: string
    profile_url?: string
  }
}

export interface SkillPost {
  id: string
  skill_slug: string
  title: string
  body: string
  product_url?: string
  post_type?: string
  created_at: string
  profiles?: {
    github_login?: string
    display_name?: string
    avatar_url?: string
  }
}

export interface NewsStory {
  slug: string
  title: string
  dek: string
  content: string[]
  sourceName: string
  sourceUrl: string
  sourceType: 'crawler' | 'user' | 'agent'
  publisherGithub?: string
  locationName: string
  lat: number
  lon: number
  category: string
  impact: string
  publishedAt: string
  aiSummary?: string
  status?: string
}

export async function loadComments(targetType: 'skill' | 'news', targetId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('comments')
    .select('id, body, created_at, status, profiles(github_login, display_name, avatar_url, profile_url)')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data || []) as PlatformComment[]
}

export async function submitComment(targetType: 'skill' | 'news', targetId: string, body: string) {
  const user = await getCurrentUser()
  const supabase = getSupabaseClient()
  if (!supabase || !user) throw new Error('Sign in with GitHub before posting a comment.')
  const { error } = await supabase.from('comments').insert({
    target_type: targetType,
    target_id: targetId,
    author_id: user.id,
    body,
    status: 'pending',
    moderation_status: 'pending',
  })
  if (error) throw error
}

export async function loadSkillPosts(skillSlug: string) {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('skill_posts')
    .select('id, skill_slug, title, body, product_url, post_type, created_at, profiles(github_login, display_name, avatar_url)')
    .eq('skill_slug', skillSlug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)
  if (error) throw error
  return (data || []) as SkillPost[]
}

export async function submitSkillClaim(skill: { slug: string; githubRepo?: string }) {
  const user = await getCurrentUser()
  const supabase = getSupabaseClient()
  if (!supabase || !user) throw new Error('Sign in with GitHub before claiming a skill.')
  const { error } = await supabase.from('skill_claims').insert({
    skill_slug: skill.slug,
    github_repo: skill.githubRepo || '',
    claimant_id: user.id,
    claimant_github_login: githubLogin(user),
    status: 'pending',
    moderation_status: 'pending',
  })
  if (error) throw error
}

export async function submitSkillPost(skillSlug: string, title: string, body: string, productUrl = '') {
  const user = await getCurrentUser()
  const supabase = getSupabaseClient()
  if (!supabase || !user) throw new Error('Sign in with GitHub before submitting owner content.')
  const { error } = await supabase.from('skill_posts').insert({
    skill_slug: skillSlug,
    author_id: user.id,
    title,
    body,
    product_url: productUrl,
    post_type: productUrl ? 'product' : 'note',
    status: 'pending',
    moderation_status: 'pending',
  })
  if (error) throw error
}

export async function loadApprovedNewsStories() {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('news_stories')
    .select('*')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })
    .limit(80)
  if (error) throw error
  return (data || []).map(normalizeNewsStory)
}

export function normalizeNewsStory(row: any): NewsStory {
  return {
    slug: row.slug,
    title: row.title,
    dek: row.dek || row.summary || '',
    content: Array.isArray(row.content) ? row.content : String(row.content || '').split(/\n\n+/).filter(Boolean),
    sourceName: row.source_name || row.sourceName || 'MapNews',
    sourceUrl: row.source_url || row.sourceUrl || '',
    sourceType: row.source_type || row.sourceType || 'crawler',
    publisherGithub: row.publisher_github || row.publisherGithub || '',
    locationName: row.location_name || row.locationName || '',
    lat: Number(row.lat),
    lon: Number(row.lon),
    category: row.category || 'World',
    impact: row.impact || 'Medium',
    publishedAt: row.published_at || row.publishedAt || '',
    aiSummary: row.ai_summary || row.aiSummary || '',
    status: row.status || 'approved',
  }
}

export function newsSourceLabel(story: Partial<NewsStory>) {
  if (story.sourceType === 'agent' && story.publisherGithub) return `Posted by @${story.publisherGithub}`
  if (story.sourceType === 'user' && story.publisherGithub) return `Posted by @${story.publisherGithub}`
  return `Source: ${story.sourceName || 'MapNews'}`
}

export function isRepoOwner(user: User | null, githubRepo = '') {
  const owner = String(githubRepo || '').split('/')[0]?.toLowerCase()
  return Boolean(owner && githubLogin(user) === owner)
}

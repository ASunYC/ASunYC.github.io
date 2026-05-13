import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

export interface PlatformProfile {
  id: string
  github_id?: string
  github_login?: string
  display_name?: string
  avatar_url?: string
  profile_url?: string
  role?: string
}

export function isPlatformConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && platformKey())
}

export function getSupabaseClient() {
  if (client !== undefined) return client
  if (typeof window === 'undefined' || !isPlatformConfigured()) {
    client = null
    return client
  }
  client = createClient(import.meta.env.VITE_SUPABASE_URL, platformKey(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  await syncProfile(data.user)
  return data.user
}

export async function signInWithGitHub() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')
  const redirectTo = typeof window === 'undefined' ? undefined : window.location.href
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo },
  })
  if (error) throw error
}

export async function signOut() {
  const supabase = getSupabaseClient()
  if (!supabase) return
  await supabase.auth.signOut()
}

export function githubLogin(user: User | null | undefined) {
  if (!user) return ''
  return String(
    user.user_metadata?.user_name ||
      user.user_metadata?.preferred_username ||
      user.user_metadata?.login ||
      '',
  ).toLowerCase()
}

export function displayName(user: User | null | undefined) {
  if (!user) return ''
  return String(user.user_metadata?.full_name || user.user_metadata?.name || githubLogin(user) || user.email || 'GitHub user')
}

export async function syncProfile(user: User) {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const login = githubLogin(user)
  const profile: PlatformProfile = {
    id: user.id,
    github_id: String(user.user_metadata?.provider_id || user.user_metadata?.sub || ''),
    github_login: login,
    display_name: displayName(user),
    avatar_url: String(user.user_metadata?.avatar_url || ''),
    profile_url: login ? `https://github.com/${login}` : '',
  }
  const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' })
  if (error) console.warn('Profile sync failed:', error.message)
  return profile
}

function platformKey() {
  return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
}

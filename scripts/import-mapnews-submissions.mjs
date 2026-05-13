#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const root = resolve(process.argv[2] || process.cwd())
const submissionsDir = join(root, 'docs', 'public', 'data', 'map-news', 'submissions')
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  throw new Error('Set SUPABASE_URL or VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing submissions.')
}

if (!existsSync(submissionsDir)) {
  throw new Error(`Submissions directory not found: ${submissionsDir}`)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const files = readdirSync(submissionsDir).filter((file) => file.endsWith('.json'))
let imported = 0

for (const file of files) {
  const payload = JSON.parse(readFileSync(join(submissionsDir, file), 'utf8'))
  validate(payload, file)
  const { error } = await supabase.from('news_submissions').upsert({
    slug: payload.slug,
    payload,
    source_type: payload.sourceType || 'agent',
    publisher_github: payload.publisherGithub || '',
    status: 'pending',
    moderation_status: 'pending',
    pr_url: payload.prUrl || '',
  }, { onConflict: 'slug' })
  if (error) throw error
  imported++
}

console.log(`Imported ${imported} MapNews submission(s).`)

function validate(payload, file) {
  for (const field of ['slug', 'title', 'dek', 'content', 'sourceName', 'sourceType', 'locationName', 'lat', 'lon', 'category', 'impact', 'publishedAt']) {
    if (payload[field] == null || payload[field] === '') throw new Error(`${file}: missing ${field}`)
  }
  if (!Array.isArray(payload.content) || !payload.content.length) throw new Error(`${file}: content must be a non-empty array`)
  if (Number.isNaN(Number(payload.lat)) || Number.isNaN(Number(payload.lon))) throw new Error(`${file}: lat/lon must be numbers`)
}

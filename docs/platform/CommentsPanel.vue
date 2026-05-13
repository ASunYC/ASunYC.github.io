<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import AuthPanel from './AuthPanel.vue'
import { loadComments, submitComment, type PlatformComment } from './content'

const props = defineProps<{
  targetType: 'skill' | 'news'
  targetId: string
  title?: string
}>()

const comments = ref<PlatformComment[]>([])
const user = ref<User | null>(null)
const body = ref('')
const loading = ref(true)
const busy = ref(false)
const message = ref('')

async function refresh() {
  loading.value = true
  try {
    comments.value = await loadComments(props.targetType, props.targetId)
  } catch (error: any) {
    message.value = error?.message || 'Unable to load comments.'
  } finally {
    loading.value = false
  }
}

async function post() {
  const text = body.value.trim()
  if (!text) return
  busy.value = true
  message.value = ''
  try {
    await submitComment(props.targetType, props.targetId, text)
    body.value = ''
    message.value = 'Comment submitted for AI pre-review and manual approval.'
  } catch (error: any) {
    message.value = error?.message || 'Unable to submit comment.'
  } finally {
    busy.value = false
  }
}

onMounted(refresh)
</script>

<template>
  <section class="comments-panel">
    <header>
      <h2>{{ title || 'Comments' }}</h2>
      <span>{{ comments.length }} approved</span>
    </header>

    <AuthPanel @session="user = $event" />

    <form class="comment-form" @submit.prevent="post">
      <textarea v-model="body" rows="4" placeholder="Share a useful note. Comments are reviewed before publication." />
      <button type="submit" :disabled="busy || !user || !body.trim()">Submit for review</button>
    </form>

    <p v-if="message" class="comment-message">{{ message }}</p>
    <div v-if="loading" class="comment-empty">Loading comments...</div>
    <div v-else-if="!comments.length" class="comment-empty">No approved comments yet.</div>
    <div v-else class="comment-list">
      <article v-for="comment in comments" :key="comment.id">
        <img v-if="comment.profiles?.avatar_url" :src="comment.profiles.avatar_url" alt="" />
        <div>
          <strong>{{ comment.profiles?.display_name || comment.profiles?.github_login || 'GitHub user' }}</strong>
          <time>{{ new Date(comment.created_at).toLocaleDateString() }}</time>
          <p>{{ comment.body }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.comments-panel {
  display: grid;
  gap: 14px;
  margin-top: 34px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 28px;
}

.comments-panel header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.comments-panel h2 {
  margin: 0;
  font-size: 1.35rem;
}

.comments-panel header span,
.comment-message,
.comment-empty {
  color: var(--vp-c-text-2);
}

.comment-form {
  display: grid;
  gap: 10px;
}

.comment-form textarea {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.comment-form button {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  background: #7dd3fc;
  color: #071018;
  font-weight: 900;
  cursor: pointer;
}

.comment-form button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.comment-list {
  display: grid;
  gap: 12px;
}

.comment-list article {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 14px;
  background: var(--vp-c-bg-soft);
}

.comment-list img {
  width: 42px;
  height: 42px;
  border-radius: 999px;
}

.comment-list strong,
.comment-list time,
.comment-list p {
  display: block;
  margin: 0;
}

.comment-list time {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

.comment-list p {
  margin-top: 8px;
  color: var(--vp-c-text-2);
  line-height: 1.65;
}
</style>

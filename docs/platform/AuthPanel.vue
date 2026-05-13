<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { displayName, getCurrentUser, isPlatformConfigured, signInWithGitHub, signOut } from './supabase'

const emit = defineEmits<{
  session: [user: User | null]
}>()

const user = ref<User | null>(null)
const busy = ref(false)
const message = ref('')
const enabled = isPlatformConfigured()

async function refresh() {
  user.value = await getCurrentUser()
  emit('session', user.value)
}

async function login() {
  busy.value = true
  message.value = ''
  try {
    await signInWithGitHub()
  } catch (error: any) {
    message.value = error?.message || 'GitHub sign-in failed.'
  } finally {
    busy.value = false
  }
}

async function logout() {
  busy.value = true
  await signOut()
  user.value = null
  emit('session', null)
  busy.value = false
}

onMounted(refresh)
</script>

<template>
  <section class="auth-panel">
    <div>
      <strong>{{ enabled ? (user ? displayName(user) : 'GitHub identity') : 'Platform preview mode' }}</strong>
      <span v-if="enabled && user">Signed in for comments, claims, and submissions.</span>
      <span v-else-if="enabled">Sign in to comment, claim skills, and submit news.</span>
      <span v-else>Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable dynamic platform features.</span>
      <p v-if="message">{{ message }}</p>
    </div>
    <button v-if="enabled && !user" type="button" :disabled="busy" @click="login">Sign in with GitHub</button>
    <button v-else-if="enabled" type="button" :disabled="busy" @click="logout">Sign out</button>
  </section>
</template>

<style scoped>
.auth-panel {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 14px;
  background: var(--vp-c-bg-soft);
}

.auth-panel div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.auth-panel strong {
  color: var(--vp-c-text-1);
}

.auth-panel span,
.auth-panel p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.45;
}

.auth-panel button {
  flex: 0 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 9px 12px;
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 640px) {
  .auth-panel {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import AuthPanel from './AuthPanel.vue'
import { isRepoOwner, loadSkillPosts, submitSkillClaim, submitSkillPost, type SkillPost } from './content'

const props = defineProps<{
  skill: {
    slug: string
    displayName: string
    githubRepo?: string
    author?: { login?: string }
  }
}>()

const user = ref<User | null>(null)
const posts = ref<SkillPost[]>([])
const claimMessage = ref('')
const postMessage = ref('')
const postTitle = ref('')
const postBody = ref('')
const productUrl = ref('')
const busy = ref(false)

const canClaim = computed(() => isRepoOwner(user.value, props.skill.githubRepo || ''))

async function refreshPosts() {
  try {
    posts.value = await loadSkillPosts(props.skill.slug)
  } catch (error: any) {
    postMessage.value = error?.message || 'Unable to load owner posts.'
  }
}

async function claim() {
  busy.value = true
  claimMessage.value = ''
  try {
    await submitSkillClaim({ slug: props.skill.slug, githubRepo: props.skill.githubRepo })
    claimMessage.value = 'Claim submitted for AI pre-review and manual approval.'
  } catch (error: any) {
    claimMessage.value = error?.message || 'Unable to submit claim.'
  } finally {
    busy.value = false
  }
}

async function submitPost() {
  if (!postTitle.value.trim() || !postBody.value.trim()) return
  busy.value = true
  postMessage.value = ''
  try {
    await submitSkillPost(props.skill.slug, postTitle.value.trim(), postBody.value.trim(), productUrl.value.trim())
    postTitle.value = ''
    postBody.value = ''
    productUrl.value = ''
    postMessage.value = 'Owner content submitted for review.'
  } catch (error: any) {
    postMessage.value = error?.message || 'Unable to submit owner content.'
  } finally {
    busy.value = false
  }
}

onMounted(refreshPosts)
</script>

<template>
  <section class="owner-panel">
    <header>
      <div>
        <p>Skill Owner Space</p>
        <h2>Author notes and product updates</h2>
      </div>
      <span>{{ posts.length }} approved updates</span>
    </header>

    <div v-if="posts.length" class="owner-posts">
      <article v-for="post in posts" :key="post.id">
        <strong>{{ post.title }}</strong>
        <p>{{ post.body }}</p>
        <a v-if="post.product_url" :href="post.product_url" target="_blank" rel="noreferrer">Open product link</a>
      </article>
    </div>
    <p v-else class="owner-empty">No approved owner updates yet.</p>

    <AuthPanel @session="user = $event" />

    <div class="claim-box">
      <p v-if="canClaim">
        Your GitHub login matches <strong>{{ skill.githubRepo }}</strong>. You can claim this shop and submit owner updates for review.
      </p>
      <p v-else>
        Skill claiming is available when your GitHub login matches the repository owner.
      </p>
      <button type="button" :disabled="busy || !canClaim" @click="claim">Claim this skill shop</button>
      <span v-if="claimMessage">{{ claimMessage }}</span>
    </div>

    <form v-if="canClaim" class="owner-form" @submit.prevent="submitPost">
      <input v-model="postTitle" type="text" placeholder="Update title" />
      <textarea v-model="postBody" rows="4" placeholder="Share an AI note, launch update, or usage tip." />
      <input v-model="productUrl" type="url" placeholder="Optional product URL" />
      <button type="submit" :disabled="busy || !postTitle.trim() || !postBody.trim()">Submit owner update</button>
      <p v-if="postMessage">{{ postMessage }}</p>
    </form>
  </section>
</template>

<style scoped>
.owner-panel {
  display: grid;
  gap: 16px;
  margin-top: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 22px;
  background: var(--vp-c-bg-soft);
}

.owner-panel header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.owner-panel header p {
  margin: 0 0 6px;
  color: #d39f3f;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.owner-panel h2,
.owner-panel p {
  margin: 0;
}

.owner-panel h2 {
  font-size: 1.35rem;
}

.owner-panel header span,
.owner-empty,
.claim-box,
.owner-form p {
  color: var(--vp-c-text-2);
}

.owner-posts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.owner-posts article,
.claim-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 14px;
  background: var(--vp-c-bg);
}

.owner-posts p {
  margin-top: 8px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.owner-posts a {
  display: inline-flex;
  margin-top: 10px;
  color: var(--vp-c-brand);
  font-weight: 800;
  text-decoration: none;
}

.claim-box {
  display: grid;
  gap: 10px;
}

.claim-box button,
.owner-form button {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  background: #f4c95d;
  color: #171717;
  font-weight: 900;
  cursor: pointer;
}

.claim-box button:disabled,
.owner-form button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.owner-form {
  display: grid;
  gap: 10px;
}

.owner-form input,
.owner-form textarea {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 11px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

@media (max-width: 720px) {
  .owner-posts {
    grid-template-columns: 1fr;
  }
}
</style>

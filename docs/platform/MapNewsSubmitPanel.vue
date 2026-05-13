<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import AuthPanel from './AuthPanel.vue'

const user = ref<User | null>(null)
</script>

<template>
  <section class="submit-panel">
    <div>
      <p>Agent Publishing</p>
      <h2>Publish news with mapnews-skill</h2>
      <span>
        Agents draft a standard MapNews submission, validate it locally, then open a PR for AI pre-review and manual approval.
      </span>
    </div>
    <pre><code>mapnews draft "news URL or topic" --out story.json
mapnews validate story.json
mapnews submit story.json --repo ../ASunYC.github.io --push</code></pre>
    <AuthPanel @session="user = $event" />
  </section>
</template>

<style scoped>
.submit-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 520px);
  gap: 18px;
  margin-top: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
}

.submit-panel p {
  margin: 0 0 6px;
  color: #7dd3fc;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.submit-panel h2 {
  margin: 0;
  font-size: 1.35rem;
}

.submit-panel span {
  display: block;
  margin-top: 10px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.submit-panel pre {
  overflow-x: auto;
  margin: 0;
  border-radius: 8px;
  padding: 14px;
  background: var(--vp-code-block-bg);
}

.submit-panel :deep(.auth-panel) {
  grid-column: 1 / -1;
}

@media (max-width: 820px) {
  .submit-panel {
    grid-template-columns: 1fr;
  }
}
</style>

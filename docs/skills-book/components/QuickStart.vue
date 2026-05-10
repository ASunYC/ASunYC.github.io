<script setup lang="ts">
const commands = [
  { comment: 'First time: fetch skills index', cmd: 'node scripts/skills-book.mjs fetch --force' },
  { comment: 'Browse categories', cmd: 'node scripts/skills-book.mjs categories' },
  { comment: 'Search for a skill', cmd: 'node scripts/skills-book.mjs search "testing"' },
  { comment: 'Install a skill', cmd: 'node scripts/skills-book.mjs install "stripe/reasoning"' },
]
</script>

<template>
  <pre class="quick-start-code"><code><span v-for="(c, i) in commands" :key="i"><span class="comment"># {{ c.comment }}</span>
{{ c.cmd }}
</span></code></pre>
</template>

<style scoped>
.comment {
  color: var(--vp-c-text-2);
}
</style>

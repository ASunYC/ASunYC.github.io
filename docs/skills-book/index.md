---
layoutClass: m-skills-book-layout
outline: [2, 3]
---

<script setup>
import FeatureSection from './components/FeatureSection.vue'
import TerminalIcon from './components/TerminalIcon.vue'
import QuickStart from './components/QuickStart.vue'
import { FEATURE_DATA } from './data'
</script>

<div class="page-header-left">

# Skills Book

<p class="subtitle">A skill management tool for Claude Code — browse, search, and install 1500+ community skills with one click.</p>

<div class="badge-group">
<span class="badge">v0.1.0</span>
<span class="badge">Node.js 22+</span>
<span class="badge">Zero Dependencies</span>
<span class="badge">1500+ Skills</span>
</div>

</div>

<FeatureSection
  v-for="{ title, items } in FEATURE_DATA"
  :key="title"
  :title="title"
  :items="items"
/>

<div class="quick-start-block">
  <p class="tip-title">
    <TerminalIcon />
    Quick Start
  </p>
  <QuickStart />
</div>

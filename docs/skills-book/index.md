---
layoutClass: m-skills-book-layout
outline: [2, 3]
---

<script setup>
import FeatureSection from './components/FeatureSection.vue'
import CliSupportStrip from './components/CliSupportStrip.vue'
import QuicklyUse from './components/QuicklyUse.vue'
import { CLI_SUPPORT, FEATURE_DATA, QUICK_USE_STEPS } from './data'
</script>

<div class="page-header-left">

# Skills Book

<p class="subtitle">A cross-agent skill marketplace CLI — browse, search, rank, and install 1500+ community skills from one local tool.</p>

<div class="badge-group">
<span class="badge">v0.1.0</span>
<span class="badge">Node.js 22+</span>
<span class="badge">Zero Dependencies</span>
<span class="badge">1500+ Skills</span>
</div>

</div>

<CliSupportStrip :items="CLI_SUPPORT" />

<QuicklyUse :steps="QUICK_USE_STEPS" />

<FeatureSection
  v-for="{ title, items } in FEATURE_DATA"
  :key="title"
  :title="title"
  :items="items"
/>

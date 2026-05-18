---
layoutClass: m-skills-book-layout
outline: [2, 3]
---

<script setup>
import FeatureSection from './components/FeatureSection.vue'
import CliSupportStrip from './components/CliSupportStrip.vue'
import QuicklyUse from './components/QuicklyUse.vue'
import RecommendedCombos from './components/RecommendedCombos.vue'
import PlatformBridge from './components/PlatformBridge.vue'
import { CLI_SUPPORT, FEATURE_DATA, QUICK_USE_STEPS, RECOMMENDED_COMBOS } from './data'
</script>

<div class="page-header-left">

# Skills Book

<p class="subtitle">Agent Skill Marketplace + Combo Recommendations for Claude Code, Codex, OpenCode, and other agent CLIs.</p>

<div class="badge-group">
<span class="badge">v0.1.0</span>
<span class="badge">Node.js 22+</span>
<span class="badge">Zero Dependencies</span>
<span class="badge">1500+ Skills</span>
</div>

<div class="shop-entry">
<a class="shop-entry-button" href="/skills-shop/">Skills Shop</a>
<p>Browse the Shop for richer skill pages, combo breakdowns, and detailed discovery data.</p>
</div>

</div>

<CliSupportStrip :items="CLI_SUPPORT" />

<QuicklyUse :steps="QUICK_USE_STEPS" />

<RecommendedCombos :fallback="RECOMMENDED_COMBOS" />

<PlatformBridge />

<FeatureSection
  v-for="{ title, items } in FEATURE_DATA"
  :key="title"
  :title="title"
  :items="items"
/>

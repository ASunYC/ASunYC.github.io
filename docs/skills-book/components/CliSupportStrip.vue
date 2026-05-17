<script setup lang="ts">
import { computed } from 'vue'
import type { CliSupportItem } from '../data'

const props = defineProps<{
  items: CliSupportItem[]
}>()

const leftItems = computed(() => [...props.items, ...props.items])
const rightItems = computed(() => {
  const reversed = [...props.items].reverse()
  return [...reversed, ...reversed]
})

function logoClass(name: string) {
  return `logo-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}
</script>

<template>
  <section class="cli-section" aria-labelledby="supported-cli-title">
    <div class="section-heading">
      <p class="section-label">Supported CLI</p>
      <h2 id="supported-cli-title">Use Skills Book across mainstream agent tools.</h2>
      <p>
        Skills Book is packaged as a standard <code>SKILL.md</code> plus a zero-dependency Node.js CLI.
        Claude Code is the default install target, while other agent CLIs can load the same skill package
        and run the marketplace commands from the repository.
      </p>
    </div>

    <div class="logo-marquee" aria-label="Supported CLI tools">
      <div class="marquee-row">
        <div class="marquee-track marquee-left">
          <article
            v-for="(item, index) in leftItems"
            :key="`${item.name}-left-${index}`"
            class="logo-tile"
          >
            <span class="logo-mark" :class="logoClass(item.name)">{{ item.mark }}</span>
            <span class="logo-name">{{ item.logo }}</span>
          </article>
        </div>
      </div>

      <div class="marquee-row">
        <div class="marquee-track marquee-right">
          <article
            v-for="(item, index) in rightItems"
            :key="`${item.name}-right-${index}`"
            class="logo-tile logo-tile-muted"
          >
            <span class="logo-mark" :class="logoClass(item.name)">{{ item.mark }}</span>
            <span class="logo-name">{{ item.logo }}</span>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cli-section {
  margin: 8px 0 40px;
  min-width: 0;
  overflow: hidden;
}

.section-heading {
  width: 100%;
  max-width: 760px;
  min-width: 0;
}

.section-label {
  margin: 0 0 8px;
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 680;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.section-heading p:not(.section-label) {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.logo-marquee {
  position: relative;
  display: grid;
  gap: 14px;
  margin-top: 24px;
  overflow: hidden;
  padding: 2px 0;
}

.logo-marquee::before,
.logo-marquee::after {
  content: '';
  position: absolute;
  top: 0;
  z-index: 2;
  width: 92px;
  height: 100%;
  pointer-events: none;
}

.logo-marquee::before {
  left: 0;
  background: linear-gradient(90deg, var(--vp-c-bg) 0%, transparent 100%);
}

.logo-marquee::after {
  right: 0;
  background: linear-gradient(270deg, var(--vp-c-bg) 0%, transparent 100%);
}

.marquee-row {
  overflow: hidden;
}

.marquee-track {
  display: flex;
  width: max-content;
  gap: 14px;
  will-change: transform;
}

.marquee-left {
  animation: marquee-left 30s linear infinite;
  animation-delay: -8s;
}

.marquee-right {
  animation: marquee-right 34s linear infinite;
  animation-delay: -12s;
}

.logo-tile {
  display: inline-flex;
  width: 220px;
  min-height: 84px;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 16px 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.logo-tile-muted {
  opacity: 0.78;
}

.logo-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--sb-accent-rgb), 0.2), rgba(132, 149, 255, 0.18));
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 760;
}

.logo-name {
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 720;
  line-height: 1.2;
  white-space: nowrap;
}

.logo-claude-code {
  background: linear-gradient(135deg, #d97745, #fbdfbd);
  color: #1d1410;
}

.logo-openai-codex {
  background: linear-gradient(135deg, #151515, #4d5a55);
  color: #f6faf7;
}

.logo-opencode {
  background: linear-gradient(135deg, #2f6fed, #8dd4ff);
  color: #07131f;
}

.logo-gemini-cli {
  background: linear-gradient(135deg, #7c3aed, #7dd3fc);
  color: #ffffff;
}

.logo-cursor {
  background: linear-gradient(135deg, #f7f7f7, #6f7787);
  color: #151515;
}

.logo-windsurf {
  background: linear-gradient(135deg, #17b7a7, #d8ff7a);
  color: #061513;
}

.logo-cline {
  background: linear-gradient(135deg, #ce5bff, #4f7cff);
  color: #ffffff;
}

.logo-roo-code {
  background: linear-gradient(135deg, #f7c948, #e85d75);
  color: #1e1012;
}

@keyframes marquee-left {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(-50% - 7px), 0, 0);
  }
}

@keyframes marquee-right {
  from {
    transform: translate3d(calc(-50% - 7px), 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-left {
    animation-duration: 72s !important;
    animation-delay: -18s !important;
  }

  .marquee-right {
    animation-duration: 80s !important;
    animation-delay: -28s !important;
  }
}

@media (max-width: 640px) {
  .section-heading {
    max-width: calc(100vw - 96px);
  }

  .section-heading h2 {
    max-width: calc(100vw - 96px);
    font-size: 21px;
  }

  .section-heading p:not(.section-label) {
    max-width: calc(100vw - 96px);
    font-size: 14px;
  }

  .logo-marquee::before,
  .logo-marquee::after {
    width: 38px;
  }

  .logo-tile {
    width: 188px;
    min-height: 72px;
    padding: 13px 14px;
  }

  .logo-mark {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    font-size: 12px;
  }

  .logo-name {
    font-size: 16px;
  }
}
</style>

<script setup lang="ts">
import { PROJECTS } from '../projects/data'

const focusAreas = [
  {
    label: 'AI Tooling',
    title: 'Agent-native workflows',
    text: 'Practical experiments around skills, prompts, automation, and the small tools that make coding with AI feel sharper.',
  },
  {
    label: 'Open Source',
    title: 'Useful things, packaged well',
    text: 'Projects are kept simple on the surface and opinionated underneath: clear commands, low setup cost, and readable defaults.',
  },
  {
    label: 'Notes',
    title: 'A working notebook',
    text: 'Design notes, implementation records, daily discoveries, and the occasional hard-won fix from real development sessions.',
  },
]

const stats = [
  { value: '1500+', label: 'skills indexed' },
  { value: '0 deps', label: 'CLI core' },
  { value: 'Node 22+', label: 'runtime' },
]
</script>

<template>
  <main class="hub-page">
    <section class="hub-hero">
      <img class="hero-art" src="/logo.jpg" alt="ASunYC avatar" />
      <div class="hero-content">
        <p class="eyebrow">ASunYC / Project Hub</p>
        <h1>AI engineering tools for modern developer workflows.</h1>
        <p class="hero-copy">
          A project hub for open-source systems, agent skills, technical notes,
          and workflow experiments focused on reliable software delivery.
        </p>
        <div class="hero-actions">
          <a class="primary-action" href="/skills-book/">Explore Skills Book</a>
          <a class="secondary-action" href="https://github.com/ASunYC">GitHub</a>
        </div>
      </div>
      <div class="hero-meta" aria-label="Project stats">
        <div v-for="item in stats" :key="item.label" class="meta-item">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </section>

    <section class="section-band intro-band" aria-labelledby="focus-title">
      <div class="section-heading">
        <p class="section-kicker">Current Direction</p>
        <h2 id="focus-title">A home for tools, notes, and systems that compound.</h2>
      </div>
      <div class="focus-grid">
        <article v-for="area in focusAreas" :key="area.title" class="focus-card">
          <span>{{ area.label }}</span>
          <h3>{{ area.title }}</h3>
          <p>{{ area.text }}</p>
        </article>
      </div>
    </section>

    <section id="projects" class="section-band project-band" aria-labelledby="projects-title">
      <div class="section-heading">
        <p class="section-kicker">Featured Work</p>
        <h2 id="projects-title">Projects worth opening first.</h2>
        <p>
          The hub starts with Skills Book because it is the core project here:
          a searchable skill marketplace and installer for Claude Code.
        </p>
      </div>

      <div class="project-showcase">
        <a
          v-for="project in PROJECTS"
          :key="project.title"
          :href="project.link"
          class="project-feature"
        >
          <div class="project-icon" v-html="project.iconSvg"></div>
          <div>
            <p class="project-label">Featured project</p>
            <h3>{{ project.title }}</h3>
            <p>{{ project.details }}</p>
          </div>
          <span class="project-arrow" aria-hidden="true">Open</span>
        </a>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hub-page {
  color: var(--vp-c-text-1);
  overflow-x: clip;
}

.hub-hero {
  position: relative;
  min-height: min(760px, calc(100vh - 64px));
  display: grid;
  align-items: end;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(8, 12, 18, 0.92) 0%, rgba(8, 12, 18, 0.78) 46%, rgba(8, 12, 18, 0.34) 100%),
    url('/logo.jpg') right center / auto 100% no-repeat,
    #080c12;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.hero-art {
  position: absolute;
  right: clamp(24px, 8vw, 132px);
  bottom: clamp(64px, 12vw, 132px);
  width: clamp(148px, 20vw, 260px);
  height: clamp(148px, 20vw, 260px);
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.32);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
}

.hero-content {
  position: relative;
  width: min(1120px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 112px 0 148px;
}

.eyebrow,
.section-kicker,
.project-label {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.eyebrow {
  color: #7dd8b3;
}

.hero-content h1 {
  max-width: 760px;
  margin: 18px 0 0;
  color: #f7fbf8;
  font-size: clamp(44px, 7vw, 92px);
  line-height: 1;
  font-weight: 760;
  letter-spacing: 0;
}

.hero-copy {
  max-width: 650px;
  margin: 26px 0 0;
  color: rgba(247, 251, 248, 0.78);
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.primary-action {
  background: #f7fbf8;
  color: #0d1514;
}

.secondary-action {
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: #f7fbf8;
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-2px);
}

.secondary-action:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.52);
}

.hero-meta {
  position: absolute;
  left: 50%;
  bottom: 32px;
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  width: min(620px, calc(100vw - 48px));
  transform: translateX(-50%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(8, 12, 18, 0.62);
  backdrop-filter: blur(16px);
}

.meta-item {
  padding: 18px 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.14);
}

.meta-item:last-child {
  border-right: 0;
}

.meta-item strong,
.meta-item span {
  display: block;
}

.meta-item strong {
  color: #f7fbf8;
  font-size: 22px;
  line-height: 1.1;
}

.meta-item span {
  margin-top: 5px;
  color: rgba(247, 251, 248, 0.64);
  font-size: 12px;
}

.section-band {
  width: min(1120px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 76px 0;
}

.intro-band {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  gap: 40px;
}

.section-heading {
  max-width: 560px;
}

.section-kicker,
.project-label {
  color: var(--vp-c-brand);
}

.section-heading h2 {
  margin: 10px 0 0;
  font-size: clamp(28px, 4vw, 48px);
  line-height: 1.08;
  font-weight: 720;
  letter-spacing: 0;
}

.section-heading p:not(.section-kicker) {
  margin: 16px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.75;
}

.focus-grid {
  display: grid;
  gap: 14px;
}

.focus-card,
.project-feature {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.focus-card {
  padding: 24px;
}

.focus-card span {
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 700;
}

.focus-card h3 {
  margin: 8px 0 0;
  font-size: 20px;
  line-height: 1.3;
  letter-spacing: 0;
}

.focus-card p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.project-band {
  border-top: 1px solid var(--vp-c-divider);
}

.project-showcase {
  margin-top: 28px;
}

.project-feature {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  padding: 28px;
  color: inherit;
  text-decoration: none;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.project-feature:hover {
  transform: translateY(-3px);
  border-color: rgba(62, 175, 124, 0.55);
  box-shadow: 0 18px 44px rgba(35, 82, 68, 0.12);
}

.project-icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-brand);
}

.project-icon :deep(svg) {
  width: 28px;
  height: 28px;
}

.project-feature h3 {
  margin: 6px 0 0;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: 0;
}

.project-feature p:not(.project-label) {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.project-arrow {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  padding: 0 14px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 650;
}

@media (max-width: 860px) {
  .hub-hero {
    display: block;
    min-height: auto;
    background:
      linear-gradient(180deg, rgba(8, 12, 18, 0.84) 0%, rgba(8, 12, 18, 0.94) 100%),
      url('/logo.jpg') center top / 100% auto no-repeat,
      #080c12;
  }

  .hero-art {
    display: none;
  }

  .hero-content {
    width: calc(100% - 32px);
    max-width: 640px;
    padding: 250px 0 28px;
  }

  .hero-meta {
    position: relative;
    left: auto;
    bottom: auto;
    grid-template-columns: 1fr 1fr 1fr;
    width: calc(100vw - 32px);
    margin: 0 auto 28px;
    transform: none;
  }

  .meta-item {
    padding: 14px 12px;
  }

  .intro-band {
    grid-template-columns: 1fr;
  }

  .section-band {
    width: calc(100% - 32px);
    max-width: 640px;
    padding: 56px 0;
  }

  .project-feature {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .project-arrow {
    grid-column: 2;
    width: max-content;
  }
}

@media (max-width: 520px) {
  .hero-content h1 {
    font-size: 40px;
    line-height: 1.05;
  }

  .hero-copy {
    font-size: 16px;
    max-width: 34ch;
  }

  .hero-actions {
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .hero-meta {
    grid-template-columns: 1fr;
  }

  .meta-item {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  }

  .meta-item:last-child {
    border-bottom: 0;
  }

  .project-feature {
    grid-template-columns: 1fr;
  }

  .project-arrow {
    grid-column: auto;
  }
}
</style>

---
layout: home
layoutClass: 'm-hub-layout'

hero:
  name: ASunYC
  text: Project Hub
  tagline: Open-source projects and developer tools
  actions:
    - text: Explore Projects
      link: '#projects'
    - text: GitHub
      link: https://github.com/ASunYC
      theme: alt
---

<script setup>
import { PROJECTS } from './projects/data'
</script>

<div id="projects" class="project-grid-wrapper">
  <p class="section-label">Work</p>
  <h2 class="section-title">Projects</h2>
  <p class="section-desc">Selected open-source projects and tools built for developers.</p>

  <div class="project-grid" style="margin-top: 24px;">
    <a
      v-for="(project, i) in PROJECTS"
      :key="project.title"
      :href="project.link"
      class="project-card-link"
    >
      <div class="spotlight-card reveal" :class="'reveal-delay-' + (i + 1)">
        <div class="project-icon-ring" v-html="project.iconSvg"></div>
        <h3 class="project-title">{{ project.title }}</h3>
        <p class="project-details">{{ project.details }}</p>
      </div>
    </a>
  </div>
</div>

<style scoped>
.project-grid-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 80px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-brand);
  margin: 0 0 8px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
}

.section-desc {
  font-size: 15px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  max-width: 65ch;
  margin: 0;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.project-card-link {
  text-decoration: none;
  color: inherit;
}

.project-icon-ring {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--vp-c-bg-mute);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 16px;
}

.project-icon-ring :deep(svg) {
  width: 24px;
  height: 24px;
}

.project-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.project-details {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .project-grid {
    grid-template-columns: 1fr;
  }
  .project-grid-wrapper {
    padding: 0 16px 48px;
  }
}
</style>

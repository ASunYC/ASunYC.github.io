---
layout: home
layoutClass: 'm-hub-layout'

hero:
  name: ASunYC
  text: Project Hub
  tagline: Showcasing open-source projects and developer tools
  image:
    src: /logo.jpg
    alt: ASunYC
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
  <h2 class="section-title">Projects</h2>
  <div class="project-grid">
    <a
      v-for="project in PROJECTS"
      :key="project.title"
      :href="project.link"
      class="project-card-link"
    >
      <div class="project-card">
        <div class="project-icon">{{ project.icon }}</div>
        <h3 class="project-title">{{ project.title }}</h3>
        <p class="project-details">{{ project.details }}</p>
      </div>
    </a>
  </div>
</div>

<style scoped>
.project-grid-wrapper {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 24px;
  text-align: center;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card-link {
  text-decoration: none;
  color: inherit;
}

.project-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  transition: all 0.25s ease;
  height: 100%;
}

.project-card-link:hover .project-card {
  border-color: var(--vp-c-brand);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.project-icon {
  font-size: 48px;
  line-height: 1;
}

.project-title {
  margin: 0;
  font-size: 20px;
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
}
</style>

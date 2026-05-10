<script setup lang="ts">
import { computed } from 'vue'
import { slugify } from '@mdit-vue/shared'
import FeatureCard from './FeatureCard.vue'
import type { FeatureCard as FeatureCardType } from './type'

const props = defineProps<{
  title: string
  items: FeatureCardType[]
}>()

const formatTitle = computed(() => slugify(props.title))
</script>

<template>
  <section class="feature-section">
    <h2 v-if="title" :id="formatTitle" tabindex="-1">
      {{ title }}
      <a class="header-anchor" :href="`#${formatTitle}`" aria-hidden="true">#</a>
    </h2>
    <div class="feature-grid">
      <FeatureCard
        v-for="{ icon, title: cardTitle, desc, command } in items"
        :key="cardTitle"
        :icon="icon"
        :title="cardTitle"
        :desc="desc"
        :command="command"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.feature-section {
  margin-bottom: 32px;

  h2 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 600;
    color: var(--vp-c-text-1);
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

@media (min-width: 640px) {
  .feature-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (min-width: 960px) {
  .feature-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
}

@media (min-width: 1440px) {
  .feature-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>

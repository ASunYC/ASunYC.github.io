---
layoutClass: m-skills-shop-layout
outline: [2, 3]
---

<script setup>
import { useData } from 'vitepress'
import SkillsShopDetail from './components/SkillsShopDetail.vue'

const { params } = useData()
</script>

<SkillsShopDetail :slug="params.slug" />

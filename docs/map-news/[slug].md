---
layoutClass: m-map-news-layout
outline: [2, 3]
---

<script setup>
import { useData } from 'vitepress'
import MapNewsDetail from './components/MapNewsDetail.vue'

const { params } = useData()
</script>

<MapNewsDetail :slug="params.slug" />

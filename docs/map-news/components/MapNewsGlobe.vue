<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import MapNewsSubmitPanel from '../../platform/MapNewsSubmitPanel.vue'
import { loadApprovedNewsStories, newsSourceLabel } from '../../platform/content'

const categoryColors = {
  World: '#7dd3fc',
  Health: '#6ee7b7',
  Economy: '#f4c95d',
  Markets: '#c084fc',
  Politics: '#fb7185',
  Security: '#f59e9e'
}

const payload = ref(null)
const activeSlug = ref('')
const activeCategory = ref('All')
const earthEl = ref(null)
const loading = ref(true)
const error = ref('')

let viewer = null
let clickHandler = null

const newsItems = computed(() => payload.value?.items || [])
const categories = computed(() => ['All', ...new Set(newsItems.value.map((item) => item.category))])

const filteredNews = computed(() => {
  if (activeCategory.value === 'All') return newsItems.value
  return newsItems.value.filter((item) => item.category === activeCategory.value)
})

const activeNews = computed(() => newsItems.value.find((item) => item.slug === activeSlug.value) || newsItems.value[0])

function colorFor(category) {
  return categoryColors[category] || '#f4c95d'
}

function detailHref(slug) {
  return `/map-news/${slug}/`
}

function truncate(value, length) {
  const text = String(value || '')
  return text.length > length ? `${text.slice(0, length - 1)}...` : text
}

function markerText(item) {
  return `${truncate(item.title, 58)}\n${truncate(item.dek, 78)}\n${truncate(newsSourceLabel(item), 58)}`
}

async function loadNews() {
  const response = await fetch('/data/map-news/news.json')
  if (!response.ok) throw new Error(`Unable to load MapNews data (${response.status})`)
  const fallbackPayload = await response.json()
  const dynamicStories = await loadApprovedNewsStories().catch((loadError) => {
    console.warn('MapNews Supabase stories unavailable, using static fallback:', loadError)
    return []
  })
  payload.value = dynamicStories.length
    ? { generatedAt: new Date().toISOString(), sourceNote: 'Supabase approved MapNews stories.', items: dynamicStories }
    : fallbackPayload
  activeSlug.value = payload.value.items?.[0]?.slug || ''
}

async function initEarth() {
  if (viewer || !earthEl.value || !newsItems.value.length) return
  try {
    const Cesium = await import('cesium')
    window.Cesium = window.Cesium || Cesium
    const googleTileOptions = {
      subdomains: ['0', '1', '2', '3'],
      maximumLevel: 20,
      tilingScheme: new Cesium.WebMercatorTilingScheme()
    }
    const satelliteProvider = new Cesium.UrlTemplateImageryProvider({
      ...googleTileOptions,
      url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      credit: 'Google Satellite'
    })
    const baseLayer = new Cesium.ImageryLayer(satelliteProvider)
    viewer = new Cesium.Viewer(earthEl.value, {
      animation: false,
      baseLayer,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      vrButton: false
    })
    const labelLayer = viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        ...googleTileOptions,
        url: 'https://mt{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
        credit: 'Google Labels'
      })
    )
    labelLayer.alpha = 0.88
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#050912')
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#1f3b4d')
    viewer.scene.skyAtmosphere.show = true
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1200000
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 26000000

    try {
      const { Render, setSdkBasePath } = await import('@metagl/sdk-render')
      setSdkBasePath('/')
      await Render.create({
        viewer,
        token: import.meta.env.VITE_METAGL_TOKEN,
        assetsBasePath: '/'
      })
    } catch (sdkError) {
      console.warn('Metagl SDK initialization fell back to Cesium only:', sdkError)
    }

    newsItems.value.forEach((item) => {
      viewer.entities.add({
        id: item.slug,
        position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 95000),
        point: {
          pixelSize: 11,
          color: Cesium.Color.fromCssColorString(colorFor(item.category)),
          outlineColor: Cesium.Color.fromCssColorString('#111722'),
          outlineWidth: 3
        },
        label: {
          text: markerText(item),
          font: '700 13px Inter, system-ui, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#050912'),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(7, 13, 18, 0.82)'),
          backgroundPadding: new Cesium.Cartesian2(12, 9),
          pixelOffset: new Cesium.Cartesian2(0, -34),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1800000, 1, 16000000, 0.6)
        }
      })
    })

    clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    clickHandler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position)
      if (picked?.id?.id) {
        window.location.href = detailHref(picked.id.id)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(45, 22, 15500000),
      duration: 0
    })
  } catch (earthError) {
    error.value = earthError.message || 'MapNews globe failed to initialize.'
  }
}

function focusNews(slug) {
  const item = newsItems.value.find((candidate) => candidate.slug === slug)
  if (!item) return
  activeSlug.value = slug
  if (!viewer || !window.Cesium) return
  viewer.camera.flyTo({
    destination: window.Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 3600000),
    duration: 0.9
  })
}

function selectCategory(category) {
  activeCategory.value = category
  const first = filteredNews.value[0]
  if (first) focusNews(first.slug)
}

onMounted(async () => {
  try {
    await loadNews()
    loading.value = false
    await nextTick()
    await initEarth()
  } catch (loadError) {
    error.value = loadError.message || 'MapNews data is not ready yet.'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  clickHandler?.destroy()
  viewer?.destroy()
})
</script>

<template>
  <section class="map-news-page">
    <header class="news-hero">
      <div>
        <p class="news-kicker">MapNews</p>
        <h1>Hot news pinned to where it happens.</h1>
        <p class="news-lede">
          MapNews collects high-signal headlines, extracts the event location, and turns each story into a two-line globe placard.
        </p>
      </div>
      <div class="news-stats" v-if="payload">
        <span><strong>{{ newsItems.length }}</strong> hot stories</span>
        <span><strong>{{ categories.length - 1 }}</strong> categories</span>
        <span><strong>{{ filteredNews.length }}</strong> visible</span>
      </div>
    </header>

    <nav class="news-filters" aria-label="MapNews categories" v-if="payload">
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :class="{ active: activeCategory === category }"
        @click="selectCategory(category)"
      >
        {{ category }}
      </button>
    </nav>

    <div v-if="loading" class="news-empty">Loading hot news...</div>
    <div v-else-if="error" class="news-empty">{{ error }}</div>
    <section v-else class="news-stage">
      <div class="earth-panel">
        <div ref="earthEl" class="earth-canvas" />
      </div>

      <aside class="news-drawer" v-if="activeNews">
        <div class="drawer-label">
          <span :style="{ backgroundColor: colorFor(activeNews.category) }"></span>
          {{ activeNews.category }} / {{ activeNews.impact }} impact
        </div>
        <h2>{{ activeNews.title }}</h2>
        <p class="drawer-meta">{{ activeNews.locationName }} / {{ activeNews.publishedAt }} / {{ newsSourceLabel(activeNews) }}</p>
        <p class="drawer-summary">{{ activeNews.dek }}</p>
        <a class="read-link" :href="detailHref(activeNews.slug)">Read full story</a>

        <div class="news-feed" aria-label="MapNews feed">
          <article
            v-for="item in filteredNews"
            :key="item.slug"
            :class="{ active: item.slug === activeSlug }"
          >
            <button type="button" @click="focusNews(item.slug)">
              <span :style="{ backgroundColor: colorFor(item.category) }"></span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.locationName }} / {{ item.category }}</small>
            </button>
            <a :href="detailHref(item.slug)">Open</a>
          </article>
        </div>
      </aside>
    </section>

    <MapNewsSubmitPanel />
  </section>
</template>

<style scoped>
.map-news-page {
  width: var(--platform-page-max-width);
  max-width: none;
  margin: 0 auto;
  padding: 24px 0 56px;
}

.news-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
  gap: 24px;
  align-items: end;
  margin-bottom: 18px;
}

.news-kicker {
  margin: 0 0 8px;
  color: #7dd3fc;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.news-hero h1 {
  max-width: 820px;
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 3.15rem);
  line-height: 1.08;
  letter-spacing: 0;
}

.news-lede {
  max-width: 780px;
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.98rem;
  line-height: 1.6;
}

.news-stats {
  display: grid;
  gap: 10px;
  min-width: 210px;
  color: var(--vp-c-text-2);
}

.news-stats span {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.news-stats strong {
  color: var(--vp-c-text-1);
}

.news-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.news-filters button {
  flex: 0 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 9px 13px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 800;
  cursor: pointer;
}

.news-filters button.active {
  border-color: #7dd3fc;
  background: rgba(125, 211, 252, 0.16);
}

.news-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 460px);
  height: clamp(620px, calc(100vh - 260px), 780px);
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #070d12;
}

.earth-panel {
  position: relative;
  min-height: 0;
  height: 100%;
}

.earth-canvas {
  position: absolute;
  inset: 0;
}

.news-drawer {
  display: flex;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(18, 20, 27, 0.96);
  color: #f6f7fb;
  padding: 22px;
}

.drawer-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #aeb6c3;
  font-size: 0.82rem;
  font-weight: 900;
  text-transform: uppercase;
}

.drawer-label span,
.news-feed button > span {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 999px;
}

.news-drawer h2 {
  margin: 12px 0 8px;
  overflow-wrap: anywhere;
  font-size: 1.45rem;
  line-height: 1.18;
}

.drawer-meta {
  margin: 0;
  color: #aeb6c3;
  font-size: 0.9rem;
}

.drawer-summary {
  flex: 0 0 auto;
  margin: 18px 0 12px;
  color: #cbd2dc;
  line-height: 1.65;
}

.read-link,
.news-feed a {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 8px 12px;
  background: #7dd3fc;
  color: #071018;
  font-weight: 900;
  text-align: center;
  text-decoration: none;
}

.read-link {
  flex: 0 0 auto;
  align-self: flex-start;
  margin-bottom: 18px;
}

.news-feed {
  display: grid;
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-color: #7dd3fc rgba(255, 255, 255, 0.08);
}

.news-feed article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
}

.news-feed article.active {
  border-color: #7dd3fc;
  background: rgba(125, 211, 252, 0.12);
}

.news-feed button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 10px;
  align-items: start;
  min-width: 0;
  border: 0;
  padding: 0;
  background: transparent;
  color: #f6f7fb;
  text-align: left;
  cursor: pointer;
}

.news-feed strong,
.news-feed small {
  overflow-wrap: anywhere;
}

.news-feed small {
  grid-column: 2;
  color: #aeb6c3;
}

.news-feed a {
  padding: 7px 10px;
  font-size: 0.82rem;
}

.news-empty {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 34px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

@media (max-width: 980px) {
  .map-news-page {
    width: min(100%, calc(100vw - 32px));
  }

  .news-hero,
  .news-stage {
    grid-template-columns: 1fr;
  }

  .news-stage {
    height: auto;
  }

  .earth-panel {
    height: 520px;
  }

  .news-drawer {
    max-height: 440px;
    border-left: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
}

@media (max-width: 620px) {
  .map-news-page {
    width: min(100%, calc(100vw - 24px));
    padding-inline: 0;
  }

  .news-hero h1 {
    font-size: 1.95rem;
  }

  .earth-panel {
    height: 460px;
  }

  .news-drawer {
    max-height: 410px;
  }

  .news-feed article {
    grid-template-columns: 1fr;
  }
}
</style>

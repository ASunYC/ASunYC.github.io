<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import 'cesium/Build/Cesium/Widgets/widgets.css'

const newsItems = [
  {
    id: 'sf-ai-infra',
    title: 'AI infrastructure teams expand edge inference rollouts',
    region: 'San Francisco',
    category: 'AI',
    time: 'Today',
    impact: 'High',
    lat: 37.7749,
    lon: -122.4194,
    summary: 'Engineering teams are moving more model-serving workloads closer to users to reduce latency and control operating cost.',
    sourceLabel: 'Technology desk'
  },
  {
    id: 'london-fintech-policy',
    title: 'Fintech policy groups push for clearer agent payment rules',
    region: 'London',
    category: 'Finance',
    time: 'Today',
    impact: 'Medium',
    lat: 51.5072,
    lon: -0.1276,
    summary: 'Regulators and builders are discussing operational standards for machine-to-machine payments and audit trails.',
    sourceLabel: 'Markets brief'
  },
  {
    id: 'singapore-agent-ops',
    title: 'Agent operations platforms add stronger deployment controls',
    region: 'Singapore',
    category: 'Ops',
    time: 'Today',
    impact: 'High',
    lat: 1.3521,
    lon: 103.8198,
    summary: 'Enterprise teams are asking for approval gates, session replay, and stronger policy controls before scaling autonomous workflows.',
    sourceLabel: 'Enterprise watch'
  },
  {
    id: 'tokyo-robotics',
    title: 'Robotics labs test multimodal planning agents',
    region: 'Tokyo',
    category: 'Robotics',
    time: 'This week',
    impact: 'Medium',
    lat: 35.6762,
    lon: 139.6503,
    summary: 'New prototypes combine visual perception, route planning, and task memory for warehouse and inspection workflows.',
    sourceLabel: 'Research signal'
  },
  {
    id: 'berlin-open-source',
    title: 'Open-source maintainers standardize skill packaging',
    region: 'Berlin',
    category: 'Open Source',
    time: 'This week',
    impact: 'Medium',
    lat: 52.52,
    lon: 13.405,
    summary: 'Maintainers are converging on portable skill formats so agent instructions can move between mainstream CLIs.',
    sourceLabel: 'Builder community'
  },
  {
    id: 'bengaluru-devtools',
    title: 'Developer tool teams ship larger context indexing flows',
    region: 'Bengaluru',
    category: 'Developer Tools',
    time: 'Today',
    impact: 'High',
    lat: 12.9716,
    lon: 77.5946,
    summary: 'Code search, local knowledge graphs, and repository memory are becoming default parts of AI-assisted engineering stacks.',
    sourceLabel: 'Devtools brief'
  },
  {
    id: 'sao-paulo-climate-data',
    title: 'Climate data groups publish higher-resolution monitoring feeds',
    region: 'Sao Paulo',
    category: 'Climate',
    time: 'This week',
    impact: 'Medium',
    lat: -23.5558,
    lon: -46.6396,
    summary: 'Public datasets are improving regional observability for weather risk, agriculture, and urban planning dashboards.',
    sourceLabel: 'Climate desk'
  },
  {
    id: 'sydney-security',
    title: 'Security teams map software supply-chain exposure',
    region: 'Sydney',
    category: 'Security',
    time: 'Today',
    impact: 'High',
    lat: -33.8688,
    lon: 151.2093,
    summary: 'Organizations are prioritizing dependency inventory, provenance checks, and automated risk triage across internal systems.',
    sourceLabel: 'Security brief'
  }
]

const categoryColors = {
  AI: '#6ee7b7',
  Finance: '#f4c95d',
  Ops: '#8ab4ff',
  Robotics: '#f59e9e',
  'Open Source': '#c084fc',
  'Developer Tools': '#7dd3fc',
  Climate: '#a7f3d0',
  Security: '#fb7185'
}

const activeId = ref(newsItems[0].id)
const activeCategory = ref('All')
const earthEl = ref(null)
const loading = ref(true)
const error = ref('')

let viewer = null
let clickHandler = null

const categories = computed(() => ['All', ...new Set(newsItems.map((item) => item.category))])

const filteredNews = computed(() => {
  if (activeCategory.value === 'All') return newsItems
  return newsItems.filter((item) => item.category === activeCategory.value)
})

const activeNews = computed(() => newsItems.find((item) => item.id === activeId.value) || newsItems[0])

function colorFor(category) {
  return categoryColors[category] || '#f4c95d'
}

async function initEarth() {
  if (viewer || !earthEl.value) return
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

    newsItems.forEach((item) => {
      viewer.entities.add({
        id: item.id,
        position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 95000),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString(colorFor(item.category)),
          outlineColor: Cesium.Color.fromCssColorString('#111722'),
          outlineWidth: 3
        },
        label: {
          text: `${item.category} / ${item.region}`,
          font: '700 14px Inter, system-ui, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#0b0f17'),
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1800000, 1, 16000000, 0.62)
        }
      })
    })

    clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    clickHandler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position)
      if (picked?.id?.id) {
        focusNews(picked.id.id)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(45, 22, 15500000),
      duration: 0
    })
  } catch (earthError) {
    error.value = earthError.message || 'MapNews globe failed to initialize.'
  } finally {
    loading.value = false
  }
}

function focusNews(id) {
  const item = newsItems.find((candidate) => candidate.id === id)
  if (!item) return
  activeId.value = id
  if (!viewer || !window.Cesium) return
  viewer.camera.flyTo({
    destination: window.Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 3600000),
    duration: 0.9
  })
}

function selectCategory(category) {
  activeCategory.value = category
  const first = filteredNews.value[0]
  if (first) focusNews(first.id)
}

onMounted(async () => {
  await nextTick()
  await initEarth()
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
        <h1>Global news signals on a live earth canvas.</h1>
        <p class="news-lede">
          A map-first newsroom view for scanning regional technology, security, climate, and market signals.
        </p>
      </div>
      <div class="news-stats">
        <span><strong>{{ newsItems.length }}</strong> signals</span>
        <span><strong>{{ categories.length - 1 }}</strong> categories</span>
        <span><strong>{{ filteredNews.length }}</strong> visible</span>
      </div>
    </header>

    <nav class="news-filters" aria-label="MapNews categories">
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

    <div v-if="error" class="news-empty">{{ error }}</div>
    <section v-else class="news-stage">
      <div class="earth-panel">
        <div ref="earthEl" class="earth-canvas" />
        <div v-if="loading" class="earth-loading">Loading globe...</div>
      </div>

      <aside class="news-drawer">
        <div class="drawer-label">
          <span :style="{ backgroundColor: colorFor(activeNews.category) }"></span>
          {{ activeNews.category }} / {{ activeNews.impact }} impact
        </div>
        <h2>{{ activeNews.title }}</h2>
        <p class="drawer-meta">{{ activeNews.region }} / {{ activeNews.time }} / {{ activeNews.sourceLabel }}</p>
        <p class="drawer-summary">{{ activeNews.summary }}</p>

        <div class="news-feed" aria-label="MapNews feed">
          <button
            v-for="item in filteredNews"
            :key="item.id"
            type="button"
            :class="{ active: item.id === activeId }"
            @click="focusNews(item.id)"
          >
            <span :style="{ backgroundColor: colorFor(item.category) }"></span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.region }} / {{ item.category }} / {{ item.time }}</small>
          </button>
        </div>
      </aside>
    </section>
  </section>
</template>

<style scoped>
.map-news-page {
  width: min(1720px, calc(100vw - 56px));
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
  max-width: 760px;
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
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px);
  height: clamp(600px, calc(100vh - 260px), 760px);
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

.earth-loading {
  position: absolute;
  left: 18px;
  top: 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  padding: 10px 12px;
  background: rgba(7, 13, 18, 0.76);
  color: #f6f7fb;
  font-weight: 800;
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
  font-size: 1.5rem;
  line-height: 1.18;
}

.drawer-meta {
  margin: 0;
  color: #aeb6c3;
  font-size: 0.9rem;
}

.drawer-summary {
  flex: 0 0 auto;
  margin: 18px 0;
  color: #cbd2dc;
  line-height: 1.65;
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

.news-feed button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 10px;
  align-items: start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: #f6f7fb;
  text-align: left;
  cursor: pointer;
}

.news-feed button.active {
  border-color: #7dd3fc;
  background: rgba(125, 211, 252, 0.12);
}

.news-feed strong,
.news-feed small {
  overflow-wrap: anywhere;
}

.news-feed small {
  grid-column: 2;
  color: #aeb6c3;
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
    max-height: 420px;
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
    max-height: 390px;
  }
}
</style>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import 'cesium/Build/Cesium/Widgets/widgets.css'

const payload = ref(null)
const activeKey = ref('')
const loading = ref(true)
const error = ref('')
const earthStatus = ref('Initializing globe')
const earthEl = ref(null)
const isListOpen = ref(false)

let viewer = null
let clickHandler = null

const activeLocation = computed(() => {
  const locations = payload.value?.locations || []
  return locations.find((location) => location.key === activeKey.value) || locations[0] || null
})

const featuredLocations = computed(() => (payload.value?.locations || []).slice(0, 8))

function skillHref(slug) {
  return `/skills-shop/${slug}/`
}

function formatStars(stars) {
  return Number(stars || 0).toLocaleString()
}

async function loadData() {
  const response = await fetch('/data/skills-shop-map.json')
  if (!response.ok) throw new Error(`Unable to load Skills Shop data (${response.status})`)
  payload.value = await response.json()
  activeKey.value = payload.value.locations?.[0]?.key || ''
}

async function initEarth() {
  if (!earthEl.value || !payload.value?.locations?.length) {
    earthStatus.value = 'No mapped skill locations yet'
    return
  }
  try {
    const Cesium = await import('cesium')
    window.Cesium = window.Cesium || Cesium
    const googleTileOptions = {
      subdomains: ['0', '1', '2', '3'],
      maximumLevel: 20,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
    }
    const satelliteProvider = new Cesium.UrlTemplateImageryProvider({
      ...googleTileOptions,
      url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      credit: 'Google Satellite',
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
      vrButton: false,
    })
    const labelLayer = viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        ...googleTileOptions,
        url: 'https://mt{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
        credit: 'Google Labels',
      })
    )
    labelLayer.alpha = 0.88
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#050912')
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#1f3b4d')
    viewer.scene.skyAtmosphere.show = true
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1200000
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 25000000

    try {
      const { Render, setSdkBasePath } = await import('@metagl/sdk-render')
      setSdkBasePath('/')
      await Render.create({
        viewer,
        token: import.meta.env.VITE_METAGL_TOKEN,
        assetsBasePath: '/',
      })
      earthStatus.value = 'SDK globe ready'
    } catch (sdkError) {
      earthStatus.value = 'Cesium globe ready'
      console.warn('Metagl SDK initialization fell back to Cesium only:', sdkError)
    }

    payload.value.locations.forEach((location) => {
      const skill = location.topSkill
      const label = `🏬 ${skill.displayName}  ★${formatStars(skill.stars)}${location.skillCount > 1 ? '  more' : ''}`
      viewer.entities.add({
        id: location.key,
        position: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 90000),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#f4c95d'),
          outlineColor: Cesium.Color.fromCssColorString('#20242e'),
          outlineWidth: 3,
        },
        label: {
          text: label,
          font: '600 15px Inter, system-ui, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#0b0f17'),
          outlineWidth: 4,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(2000000, 1, 16000000, 0.62),
        },
      })
    })

    clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    clickHandler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position)
      if (picked?.id?.id) {
        activeKey.value = picked.id.id
        isListOpen.value = true
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    const first = payload.value.locations[0]
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(first.lon, first.lat, 8500000),
      duration: 0,
    })
  } catch (earthError) {
    earthStatus.value = 'List mode'
    console.warn('Globe initialization failed:', earthError)
  }
}

function focusLocation(location) {
  activeKey.value = location.key
  isListOpen.value = true
  if (!viewer || !window.Cesium) return
  viewer.camera.flyTo({
    destination: window.Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 4200000),
    duration: 1.0,
  })
}

onMounted(async () => {
  try {
    await loadData()
    loading.value = false
    await nextTick()
    await initEarth()
  } catch (loadError) {
    error.value = loadError.message || 'Skills Shop data is not ready yet.'
    loading.value = false
  }
})

onBeforeUnmount(() => {
  clickHandler?.destroy()
  viewer?.destroy()
})
</script>

<template>
  <section class="shop-page">
    <header class="shop-hero">
      <div>
        <p class="shop-kicker">Skills Shop</p>
        <h1>Explore agent skills as a living marketplace.</h1>
        <p class="shop-lede">
          Skills Book turns public skill repositories into a SQLite LLM Wiki, then projects the highest-signal skills onto a global shop map.
        </p>
      </div>
      <div class="shop-stats" v-if="payload">
        <span><strong>{{ payload.totalSkills }}</strong> skills indexed</span>
        <span><strong>{{ payload.mappedSkills }}</strong> mapped shops</span>
        <span><strong>{{ payload.locations.length }}</strong> locations</span>
      </div>
    </header>

    <div v-if="loading" class="shop-empty">Loading Skills Shop...</div>
    <div v-else-if="error" class="shop-empty">{{ error }}</div>
    <template v-else>
      <section class="shop-stage">
        <div class="earth-panel">
          <div ref="earthEl" class="earth-canvas" />
          <div class="earth-status">{{ earthStatus }}</div>
        </div>

        <aside class="shop-drawer" v-if="activeLocation">
          <div class="drawer-header">
            <span class="store-icon">🏬</span>
            <div>
              <p>{{ activeLocation.label }}</p>
              <h2>{{ activeLocation.topSkill.displayName }}</h2>
            </div>
          </div>
          <p class="drawer-desc">{{ activeLocation.topSkill.description }}</p>
          <div class="drawer-actions">
            <a class="primary-link" :href="skillHref(activeLocation.topSkill.slug)">Details</a>
            <button v-if="activeLocation.skillCount > 1" type="button" @click="isListOpen = !isListOpen">
              {{ isListOpen ? 'Hide' : 'More' }} {{ activeLocation.skillCount }}
            </button>
          </div>
          <div v-if="isListOpen || activeLocation.skillCount === 1" class="skill-list">
            <div v-for="skill in activeLocation.skills" :key="skill.slug" class="skill-row">
              <div>
                <strong>{{ skill.displayName }}</strong>
                <span>{{ skill.category }}</span>
              </div>
              <span class="stars">★{{ formatStars(skill.stars) }}</span>
              <a :href="skillHref(skill.slug)">Details</a>
            </div>
          </div>
        </aside>
      </section>

      <section class="location-strip">
        <button
          v-for="location in featuredLocations"
          :key="location.key"
          type="button"
          :class="{ active: location.key === activeKey }"
          @click="focusLocation(location)"
        >
          <span>🏬</span>
          <strong>{{ location.topSkill.displayName }}</strong>
          <small>{{ location.label }} · ★{{ formatStars(location.topSkill.stars) }}</small>
        </button>
      </section>
    </template>
  </section>
</template>

<style scoped>
.shop-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 20px 64px;
}

.shop-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  margin-bottom: 28px;
}

.shop-kicker {
  margin: 0 0 8px;
  color: #d39f3f;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.shop-hero h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4.9rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.shop-lede {
  max-width: 760px;
  margin: 18px 0 0;
  color: var(--vp-c-text-2);
  font-size: 1.05rem;
  line-height: 1.7;
}

.shop-stats {
  display: grid;
  gap: 10px;
  min-width: 210px;
  color: var(--vp-c-text-2);
}

.shop-stats span {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.shop-stats strong {
  color: var(--vp-c-text-1);
}

.shop-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  min-height: 640px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #070d12;
}

.earth-panel {
  position: relative;
  min-height: 640px;
}

.earth-canvas {
  position: absolute;
  inset: 0;
}

.earth-status {
  position: absolute;
  left: 18px;
  bottom: 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 7px 12px;
  background: rgba(6, 11, 18, 0.72);
  color: #d9e4f0;
  font-size: 0.78rem;
  backdrop-filter: blur(12px);
}

.shop-drawer {
  display: flex;
  min-height: 0;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(18, 20, 27, 0.96);
  color: #f6f7fb;
  padding: 22px;
}

.drawer-header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.store-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  background: #f4c95d;
  color: #141414;
  font-size: 1.4rem;
}

.drawer-header p {
  margin: 0 0 4px;
  color: #aeb6c3;
  font-size: 0.8rem;
}

.drawer-header h2 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 1.25rem;
}

.drawer-desc {
  margin: 18px 0;
  color: #cbd2dc;
  line-height: 1.65;
}

.drawer-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.drawer-actions a,
.drawer-actions button,
.skill-row a {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 8px 12px;
  background: #f4c95d;
  color: #171717;
  font-weight: 800;
  text-decoration: none;
}

.drawer-actions button {
  background: transparent;
  color: #f6f7fb;
  cursor: pointer;
}

.skill-list {
  display: grid;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.skill-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.skill-row strong,
.skill-row span {
  display: block;
  overflow-wrap: anywhere;
}

.skill-row span {
  color: #aeb6c3;
  font-size: 0.78rem;
}

.skill-row .stars {
  color: #f4c95d;
  font-weight: 800;
  white-space: nowrap;
}

.skill-row a {
  padding: 7px 10px;
  font-size: 0.82rem;
}

.location-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.location-strip button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 10px;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
}

.location-strip button.active {
  border-color: #d39f3f;
}

.location-strip strong,
.location-strip small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-strip small {
  grid-column: 2;
  color: var(--vp-c-text-2);
}

.shop-empty {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 34px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

@media (max-width: 920px) {
  .shop-hero,
  .shop-stage {
    grid-template-columns: 1fr;
  }

  .shop-stage,
  .earth-panel {
    min-height: 520px;
  }

  .shop-drawer {
    border-left: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .location-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .shop-page {
    padding-inline: 14px;
  }

  .shop-hero h1 {
    font-size: 2.45rem;
  }

  .shop-stage,
  .earth-panel {
    min-height: 460px;
  }

  .skill-row {
    grid-template-columns: 1fr auto;
  }

  .skill-row a {
    grid-column: 1 / -1;
    text-align: center;
  }

  .location-strip {
    grid-template-columns: 1fr;
  }
}
</style>

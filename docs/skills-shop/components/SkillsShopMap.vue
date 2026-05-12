<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'cesium/Build/Cesium/Widgets/widgets.css'

const modes = [
  { id: 'view', label: 'View' },
  { id: 'wiki', label: 'Wiki' },
  { id: 'graph', label: 'Graph' }
]

const payload = ref(null)
const graphPayload = ref(null)
const activeMode = ref('view')
const activeKey = ref('')
const activeCategory = ref('All')
const wikiQuery = ref('')
const loading = ref(true)
const graphLoading = ref(false)
const error = ref('')
const graphError = ref('')
const earthEl = ref(null)
const isListOpen = ref(false)

let viewer = null
let clickHandler = null

const activeLocation = computed(() => {
  const locations = payload.value?.locations || []
  return locations.find((location) => location.key === activeKey.value) || locations[0] || null
})

const featuredLocations = computed(() => (payload.value?.locations || []).slice(0, 8))

const allSkills = computed(() => {
  const bySlug = new Map()
  for (const location of payload.value?.locations || []) {
    for (const skill of location.skills || []) {
      bySlug.set(skill.slug, {
        ...skill,
        mapLabel: location.label,
        mapKey: location.key
      })
    }
  }
  return [...bySlug.values()].sort((a, b) => (b.stars || 0) - (a.stars || 0))
})

const categorySummary = computed(() => {
  const counts = new Map()
  for (const skill of allSkills.value) {
    const category = skill.category || 'Uncategorized'
    counts.set(category, (counts.get(category) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

const visibleCategories = computed(() => ['All', ...categorySummary.value.map((category) => category.name)])

const wikiGroups = computed(() => {
  const query = wikiQuery.value.trim().toLowerCase()
  const groups = new Map()
  for (const skill of allSkills.value) {
    const category = skill.category || 'Uncategorized'
    if (activeCategory.value !== 'All' && activeCategory.value !== category) continue
    if (query) {
      const haystack = `${skill.displayName} ${skill.description || ''} ${category}`.toLowerCase()
      if (!haystack.includes(query)) continue
    }
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(skill)
  }
  return [...groups.entries()]
    .map(([category, skills]) => ({ category, skills }))
    .sort((a, b) => b.skills.length - a.skills.length || a.category.localeCompare(b.category))
})

const graphStats = computed(() => graphPayload.value?.statistics || null)

const graphCommunities = computed(() => {
  const nodeById = new Map((graphPayload.value?.nodes || []).map((node) => [node.id, node]))
  return (graphPayload.value?.communities || [])
    .map((community) => {
      const nodes = community.nodeIds
        .map((id) => nodeById.get(id))
        .filter(Boolean)
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      return { ...community, nodes, count: nodes.length }
    })
    .filter((community) => community.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 12)
})

const graphLayout = computed(() => {
  const graph = graphPayload.value
  if (!graph?.nodes?.length) return { nodes: [], edges: [] }
  const nodes = graph.nodes
    .slice()
    .sort((a, b) => (b.degree || 0) - (a.degree || 0) || (b.stars || 0) - (a.stars || 0))
    .slice(0, 96)
  const nodeIds = new Set(nodes.map((node) => node.id))
  const positions = new Map()
  const centerX = 520
  const centerY = 330
  const radius = 250
  nodes.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / nodes.length
    const ring = index < 24 ? radius * 0.58 : radius
    positions.set(node.id, {
      ...node,
      x: centerX + Math.cos(angle) * ring,
      y: centerY + Math.sin(angle) * ring,
      size: Math.max(5, Math.min(15, 5 + Math.sqrt(node.degree || 0)))
    })
  })
  const edges = (graph.edges || [])
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .slice(0, 220)
    .map((edge) => ({
      ...edge,
      sourceNode: positions.get(edge.source),
      targetNode: positions.get(edge.target)
    }))
    .filter((edge) => edge.sourceNode && edge.targetNode)
  return { nodes: [...positions.values()], edges }
})

const graphEdgeList = computed(() => (graphPayload.value?.edges || []).slice(0, 18))

const graphNodeById = computed(() => new Map((graphPayload.value?.nodes || []).map((node) => [node.id, node])))

function skillHref(slug) {
  return `/skills-shop/${slug}/`
}

function formatStars(stars) {
  return Number(stars || 0).toLocaleString()
}

function edgeName(id) {
  return graphNodeById.value.get(id)?.name || id.replace(/^skill:/, '')
}

async function loadData() {
  const response = await fetch('/data/skills-shop-map.json')
  if (!response.ok) throw new Error(`Unable to load Skills Shop data (${response.status})`)
  payload.value = await response.json()
  activeKey.value = payload.value.locations?.[0]?.key || ''
}

async function loadGraph() {
  if (graphPayload.value || graphLoading.value) return
  graphLoading.value = true
  graphError.value = ''
  try {
    const response = await fetch('/data/skills-shop/graph.json')
    if (!response.ok) throw new Error(`Unable to load graph data (${response.status})`)
    graphPayload.value = await response.json()
  } catch (loadError) {
    graphError.value = loadError.message || 'Knowledge graph data is not ready yet.'
  } finally {
    graphLoading.value = false
  }
}

async function initEarth() {
  if (viewer || !earthEl.value || !payload.value?.locations?.length) {
    return
  }
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
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 25000000

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

    payload.value.locations.forEach((location) => {
      const skill = location.topSkill
      const label = `Shop ${skill.displayName}  star ${formatStars(skill.stars)}${location.skillCount > 1 ? '  more' : ''}`
      viewer.entities.add({
        id: location.key,
        position: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 90000),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#f4c95d'),
          outlineColor: Cesium.Color.fromCssColorString('#20242e'),
          outlineWidth: 3
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
          scaleByDistance: new Cesium.NearFarScalar(2000000, 1, 16000000, 0.62)
        }
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
      duration: 0
    })
  } catch (earthError) {
    console.warn('Globe initialization failed:', earthError)
  }
}

function focusLocation(location) {
  activeMode.value = 'view'
  activeKey.value = location.key
  isListOpen.value = true
  if (!viewer || !window.Cesium) return
  viewer.camera.flyTo({
    destination: window.Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 4200000),
    duration: 1.0
  })
}

async function setMode(mode) {
  activeMode.value = mode
  if (mode === 'graph') await loadGraph()
  if (mode === 'view') {
    await nextTick()
    await initEarth()
  }
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

watch(activeMode, async (mode) => {
  if (mode === 'graph') await loadGraph()
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

    <nav class="shop-tabs" aria-label="Skills Shop sections">
      <button
        v-for="mode in modes"
        :key="mode.id"
        type="button"
        :class="{ active: activeMode === mode.id }"
        @click="setMode(mode.id)"
      >
        {{ mode.label }}
      </button>
    </nav>

    <div v-if="loading" class="shop-empty">Loading Skills Shop...</div>
    <div v-else-if="error" class="shop-empty">{{ error }}</div>
    <template v-else>
      <section v-show="activeMode === 'view'" class="mode-panel">
        <section class="shop-stage">
          <div class="earth-panel">
            <div ref="earthEl" class="earth-canvas" />
          </div>

          <aside class="shop-drawer" v-if="activeLocation">
            <div class="drawer-header">
              <span class="store-icon" aria-hidden="true">&#127980;</span>
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
                <span class="stars">star {{ formatStars(skill.stars) }}</span>
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
            <span aria-hidden="true">&#127980;</span>
            <strong>{{ location.topSkill.displayName }}</strong>
            <small>{{ location.label }} / star {{ formatStars(location.topSkill.stars) }}</small>
          </button>
        </section>
      </section>

      <section v-show="activeMode === 'wiki'" class="mode-panel wiki-panel">
        <div class="wiki-tools">
          <div class="category-rail">
            <button
              v-for="category in visibleCategories"
              :key="category"
              type="button"
              :class="{ active: activeCategory === category }"
              @click="activeCategory = category"
            >
              <span>{{ category }}</span>
              <strong v-if="category === 'All'">{{ allSkills.length }}</strong>
              <strong v-else>{{ categorySummary.find((item) => item.name === category)?.count }}</strong>
            </button>
          </div>
          <label class="wiki-search">
            <span>Search</span>
            <input v-model="wikiQuery" type="search" placeholder="skill name, category, description" />
          </label>
        </div>

        <div class="wiki-groups">
          <section v-for="group in wikiGroups" :key="group.category" class="wiki-group">
            <header>
              <h2>{{ group.category }}</h2>
              <span>{{ group.skills.length }} skills</span>
            </header>
            <div class="wiki-grid">
              <article v-for="skill in group.skills" :key="skill.slug" class="wiki-item">
                <div>
                  <h3>{{ skill.displayName }}</h3>
                  <p>{{ skill.description || 'No description available.' }}</p>
                </div>
                <footer>
                  <span>star {{ formatStars(skill.stars) }}</span>
                  <a :href="skillHref(skill.slug)">Open</a>
                </footer>
              </article>
            </div>
          </section>
        </div>
      </section>

      <section v-show="activeMode === 'graph'" class="mode-panel graph-panel">
        <div v-if="graphLoading" class="shop-empty">Loading knowledge graph...</div>
        <div v-else-if="graphError" class="shop-empty">{{ graphError }}</div>
        <template v-else-if="graphPayload">
          <div class="graph-summary" v-if="graphStats">
            <span><strong>{{ graphStats.totalNodes }}</strong> nodes</span>
            <span><strong>{{ graphStats.exportedEdges }}</strong> visible edges</span>
            <span><strong>{{ graphStats.totalEdges }}</strong> total relations</span>
          </div>

          <section class="graph-stage">
            <div class="graph-canvas" aria-label="Knowledge graph preview">
              <svg viewBox="0 0 1040 660" role="img">
                <line
                  v-for="edge in graphLayout.edges"
                  :key="`${edge.source}-${edge.target}-${edge.relation}`"
                  :x1="edge.sourceNode.x"
                  :y1="edge.sourceNode.y"
                  :x2="edge.targetNode.x"
                  :y2="edge.targetNode.y"
                  :stroke-width="Math.max(1, edge.weight * 2)"
                />
                <a
                  v-for="node in graphLayout.nodes"
                  :key="node.id"
                  :href="skillHref(node.slug)"
                >
                  <circle :cx="node.x" :cy="node.y" :r="node.size" />
                  <text v-if="node.degree > 20" :x="node.x + 12" :y="node.y + 4">{{ node.name }}</text>
                </a>
              </svg>
            </div>

            <aside class="graph-side">
              <h2>Knowledge communities</h2>
              <div class="community-list">
                <div v-for="community in graphCommunities" :key="community.id" class="community-item">
                  <div>
                    <strong>{{ community.label }}</strong>
                    <span>{{ community.count }} skills</span>
                  </div>
                  <a v-if="community.nodes[0]" :href="skillHref(community.nodes[0].slug)">
                    {{ community.nodes[0].name }}
                  </a>
                </div>
              </div>
            </aside>
          </section>

          <section class="edge-list">
            <h2>Strongest relations</h2>
            <div v-for="edge in graphEdgeList" :key="`${edge.source}-${edge.target}-${edge.evidence}`" class="edge-row">
              <strong>{{ edgeName(edge.source) }}</strong>
              <span>{{ edge.relation }}</span>
              <strong>{{ edgeName(edge.target) }}</strong>
            </div>
          </section>
        </template>
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
  margin-bottom: 22px;
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

.shop-stats span,
.graph-summary span {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.shop-stats strong,
.graph-summary strong {
  color: var(--vp-c-text-1);
}

.shop-tabs {
  display: inline-flex;
  gap: 6px;
  margin-bottom: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 5px;
  background: var(--vp-c-bg-soft);
}

.shop-tabs button {
  border: 0;
  border-radius: 6px;
  padding: 9px 18px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 800;
  cursor: pointer;
}

.shop-tabs button.active {
  background: #f4c95d;
  color: #171717;
}

.mode-panel {
  margin-top: 0;
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

.store-icon,
.location-strip button > span {
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #f4c95d;
  color: #141414;
  font-size: 1.25rem;
  font-weight: 900;
}

.store-icon {
  width: 44px;
  height: 44px;
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
.skill-row a,
.wiki-item a,
.community-item a {
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
  grid-template-columns: 42px minmax(0, 1fr);
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

.location-strip button > span {
  width: 42px;
  height: 36px;
  grid-row: span 2;
}

.location-strip strong,
.location-strip small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-strip small {
  color: var(--vp-c-text-2);
}

.wiki-tools {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
  margin-bottom: 22px;
}

.category-rail {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.category-rail button {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.category-rail button.active {
  border-color: #d39f3f;
  background: rgba(244, 201, 93, 0.18);
}

.category-rail strong {
  color: #d39f3f;
}

.wiki-search {
  display: grid;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-weight: 700;
}

.wiki-search input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 11px 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.wiki-groups {
  display: grid;
  gap: 30px;
}

.wiki-group > header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: end;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 10px;
}

.wiki-group h2,
.graph-side h2,
.edge-list h2 {
  margin: 0;
  font-size: 1.3rem;
}

.wiki-group header span {
  color: var(--vp-c-text-2);
  font-weight: 800;
}

.wiki-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.wiki-item {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
}

.wiki-item h3 {
  margin: 0 0 10px;
  overflow-wrap: anywhere;
  font-size: 1rem;
}

.wiki-item p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--vp-c-text-2);
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.wiki-item footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
}

.wiki-item footer span {
  color: #d39f3f;
  font-weight: 900;
}

.graph-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
  color: var(--vp-c-text-2);
}

.graph-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
  align-items: stretch;
}

.graph-canvas,
.graph-side,
.edge-list {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.graph-canvas {
  min-height: 560px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 45%, rgba(244, 201, 93, 0.18), transparent 34%), #070d12;
}

.graph-canvas svg {
  width: 100%;
  height: 100%;
  min-height: 560px;
}

.graph-canvas line {
  stroke: rgba(169, 185, 204, 0.18);
}

.graph-canvas circle {
  fill: #f4c95d;
  stroke: #111722;
  stroke-width: 2;
}

.graph-canvas text {
  fill: #f6f7fb;
  font-size: 13px;
  font-weight: 800;
  paint-order: stroke;
  stroke: #070d12;
  stroke-width: 4px;
}

.graph-side {
  padding: 18px;
}

.community-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.community-item,
.edge-row {
  display: grid;
  gap: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px;
  background: var(--vp-c-bg);
}

.community-item strong,
.community-item span {
  display: block;
}

.community-item span {
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
}

.community-item a {
  justify-self: start;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.edge-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding: 18px;
}

.edge-row {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
}

.edge-row strong {
  overflow-wrap: anywhere;
}

.edge-row span {
  border-radius: 999px;
  padding: 5px 9px;
  background: rgba(244, 201, 93, 0.18);
  color: #d39f3f;
  font-size: 0.78rem;
  font-weight: 900;
}

.shop-empty {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 34px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

@media (max-width: 980px) {
  .shop-hero,
  .shop-stage,
  .wiki-tools,
  .graph-stage {
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

  .location-strip,
  .wiki-grid,
  .graph-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .shop-page {
    padding-inline: 14px;
  }

  .shop-hero h1 {
    font-size: 2.45rem;
  }

  .shop-tabs,
  .shop-tabs button {
    width: 100%;
  }

  .shop-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .shop-tabs button {
    padding-inline: 8px;
  }

  .shop-stage,
  .earth-panel {
    min-height: 460px;
  }

  .skill-row,
  .edge-row {
    grid-template-columns: 1fr;
  }

  .skill-row a {
    text-align: center;
  }

  .location-strip,
  .wiki-grid,
  .graph-summary {
    grid-template-columns: 1fr;
  }
}
</style>

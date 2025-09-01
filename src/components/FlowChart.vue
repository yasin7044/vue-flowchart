<template>
  <div class="flowchart-container" ref="containerRef">
    <div class="flowchart" :style="flowchartStyle">
      <!-- Render edges first (behind nodes) -->
      <Edge
        v-for="edge in positionedEdges"
        :key="edge.id"
        :from-node-id="edge.from.nodeId"
        :from-port-id="edge.from.portId"
        :to-node-id="edge.to.nodeId"
        :to-port-id="edge.to.portId"
        :from-position="edge.fromPosition"
        :to-position="edge.toPosition"
        :type="edge.type"
        @click="handleEdgeClick"
      />

      <!-- Render nodes -->
      <Node
        v-for="node in positionedNodes"
        :key="node.id"
        :id="node.id"
        :type="node.type"
        :label="node.label"
        :ports="node.ports"
        :node="node"
        :style="getNodeStyle(node)"
        @click="handleNodeClick"
      >
        <!-- Custom node slots -->
        <template
          v-if="$slots[`node-${node.type}`]"
          #[`node-${node.type}`]="{ node }"
        >
          <slot :name="`node-${node.type}`" :node="node" />
        </template>
      </Node>
    </div>

    <!-- Zoom controls -->
    <div class="zoom-controls" v-if="showZoomControls">
      <button @click="zoomIn" :disabled="scale >= maxZoom" class="zoom-btn">
        <span>+</span>
      </button>
      <button @click="zoomOut" :disabled="scale <= minZoom" class="zoom-btn">
        <span>−</span>
      </button>
      <button @click="resetZoom" class="zoom-btn">
        <span>⌂</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import {
  useElementSize,
  useMouse,
  useEventListener,
  useThrottleFn,
  useDebounceFn,
  useLocalStorage,
  usePreferredDark,
  useWindowSize,
} from '@vueuse/core'
import Node from './Node.vue'
import Port from './Port.vue'
import Edge from './Edge.vue'
import {
  layoutFlowchart,
  getFlowchartHeight,
  getFlowchartWidth,
} from './utils/layout.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ nodes: [], edges: [] }),
  },
  layoutOptions: {
    type: Object,
    default: () => ({}),
  },
  showZoomControls: {
    type: Boolean,
    default: true,
  },
  enableZoom: {
    type: Boolean,
    default: true,
  },
  enablePan: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'node-click',
  'edge-click',
  'port-connect',
  'zoom-change',
  'pan-change',
])

// Container ref for size tracking
const containerRef = ref(null)
const { width: containerWidth, height: containerHeight } =
  useElementSize(containerRef)

// Zoom and pan state
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

// Zoom limits
const minZoom = 0.1
const maxZoom = 3

// Mouse tracking
const { x: mouseX, y: mouseY } = useMouse()

// Window size for responsive behavior
const { width: windowWidth, height: windowHeight } = useWindowSize()

// Local storage for user preferences
const userPreferences = useLocalStorage('flowchart-preferences', {
  scale: 1,
  translateX: 0,
  translateY: 0,
  theme: 'auto',
})

// Theme detection
const isDark = usePreferredDark()
const currentTheme = computed(() => {
  if (userPreferences.value.theme === 'auto') {
    return isDark.value ? 'dark' : 'light'
  }
  return userPreferences.value.theme
})

// Process layout with debounced updates
const positionedData = ref(layoutFlowchart(props.data, props.layoutOptions))

const updateLayout = useDebounceFn(() => {
  positionedData.value = layoutFlowchart(props.data, props.layoutOptions)
}, 100)

// Watch for data changes and recalculate layout
watch(
  () => props.data,
  () => updateLayout(),
  { deep: true }
)

const positionedNodes = computed(() => positionedData.value.nodes)
const positionedEdges = computed(() => positionedData.value.edges)

// Calculate flowchart dimensions
const flowchartHeight = computed(() => {
  return getFlowchartHeight(positionedNodes.value, props.layoutOptions)
})

const flowchartWidth = computed(() => {
  return getFlowchartWidth(positionedNodes.value, props.layoutOptions)
})

// Responsive centering
const centerOffsetX = computed(() => {
  if (!containerWidth.value) return 0
  return Math.max(
    0,
    (containerWidth.value - flowchartWidth.value * scale.value) / 2
  )
})

const centerOffsetY = computed(() => {
  if (!containerHeight.value) return 0
  return Math.max(
    0,
    (containerHeight.value - flowchartHeight.value * scale.value) / 2
  )
})

const flowchartStyle = computed(() => ({
  height: `${flowchartHeight.value}px`,
  width: `${flowchartWidth.value}px`,
  position: 'relative',
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: '0 0',
  transition: isDragging.value ? 'none' : 'transform 0.2s ease-out',
}))

// Get node positioning style
const getNodeStyle = (node) => {
  const nodeWidth = node.width || 200
  return {
    position: 'absolute',
    left: `${node.position.x}px`, // Use calculated x position
    top: `${node.position.y - 60}px`, // Center the node (assuming 120px height)
    zIndex: 10,
  }
}

// Zoom functions
const zoomIn = useThrottleFn(() => {
  if (scale.value < maxZoom) {
    scale.value = Math.min(maxZoom, scale.value * 1.2)
    emit('zoom-change', { scale: scale.value })
  }
}, 100)

const zoomOut = useThrottleFn(() => {
  if (scale.value > minZoom) {
    scale.value = Math.max(minZoom, scale.value / 1.2)
    emit('zoom-change', { scale: scale.value })
  }
}, 100)

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  emit('zoom-change', { scale: scale.value })
  emit('pan-change', { x: translateX.value, y: translateY.value })
}

// Mouse wheel zoom
const handleWheel = useThrottleFn((event) => {
  if (!props.enableZoom) return

  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(minZoom, Math.min(maxZoom, scale.value * delta))

  if (newScale !== scale.value) {
    scale.value = newScale
    emit('zoom-change', { scale: scale.value })
  }
}, 50)

// Pan functionality
const startPan = () => {
  if (!props.enablePan) return
  isDragging.value = true
  lastMousePos.value = { x: mouseX.value, y: mouseY.value }
}

const updatePan = useThrottleFn(() => {
  if (!isDragging.value || !props.enablePan) return

  const deltaX = mouseX.value - lastMousePos.value.x
  const deltaY = mouseY.value - lastMousePos.value.y

  translateX.value += deltaX
  translateY.value += deltaY

  lastMousePos.value = { x: mouseX.value, y: mouseY.value }
  emit('pan-change', { x: translateX.value, y: translateY.value })
}, 16) // ~60fps

const stopPan = () => {
  isDragging.value = false
}

// Event listeners
useEventListener(containerRef, 'wheel', handleWheel, { passive: false })
useEventListener(containerRef, 'mousedown', startPan)
useEventListener(window, 'mousemove', updatePan)
useEventListener(window, 'mouseup', stopPan)

// Save preferences when they change
watch([scale, translateX, translateY], () => {
  userPreferences.value.scale = scale.value
  userPreferences.value.translateX = translateX.value
  userPreferences.value.translateY = translateY.value
})

// Load saved preferences
watch(
  userPreferences,
  (prefs) => {
    if (prefs.scale) scale.value = prefs.scale
    if (prefs.translateX) translateX.value = prefs.translateX
    if (prefs.translateY) translateY.value = prefs.translateY
  },
  { immediate: true }
)

// Event handlers
const handleNodeClick = (nodeData) => {
  emit('node-click', nodeData)
}

const handleEdgeClick = (edgeData) => {
  emit('edge-click', edgeData)
}
</script>

<style scoped>
.flowchart-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
  cursor: grab;
}

.flowchart-container:active {
  cursor: grabbing;
}

.flowchart {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 40px;
  position: relative;
  min-width: 800px;
  min-height: 600px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

/* Zoom controls */
.zoom-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.zoom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Ensure nodes are above edges */
.flowchart > * {
  position: absolute;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .flowchart-container {
    padding: 10px;
  }

  .flowchart {
    padding: 20px;
    min-width: 600px;
  }

  .zoom-controls {
    top: 10px;
    right: 10px;
  }

  .zoom-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>

<script setup></script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue Flowchart Engine</h1>
      <div class="header-controls">
        <button @click="addNode" class="btn btn-primary">Add Node</button>
        <button @click="resetChart" class="btn btn-secondary">Reset</button>
        <button @click="toggleTheme" class="btn btn-theme">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="app-main">
      <FlowChart
        :data="chartData"
        :layout-options="layoutOptions"
        :show-zoom-controls="true"
        :enable-zoom="true"
        :enable-pan="true"
        @node-click="handleNodeClick"
        @edge-click="handleEdgeClick"
        @zoom-change="handleZoomChange"
        @pan-change="handlePanChange"
      >
        <!-- Custom node slots -->
        <template #node-trigger="{ node }">
          <div class="custom-trigger-content">
            <p>🚀 Custom trigger content</p>
            <small>Node ID: {{ node.id }}</small>
          </div>
        </template>

        <template #node-decision="{ node }">
          <div class="custom-decision-content">
            <p>❓ Custom decision content</p>
            <small>Status: {{ node.status }}</small>
          </div>
        </template>

        <template #node-action="{ node }">
          <div class="custom-action-content">
            <p>⚡ Custom action content</p>
            <small>Type: {{ node.type }}</small>
          </div>
        </template>
      </FlowChart>
    </main>

    <!-- Info panel -->
    <div class="info-panel" v-if="selectedNode">
      <h3>Selected Node</h3>
      <p><strong>ID:</strong> {{ selectedNode.id }}</p>
      <p><strong>Type:</strong> {{ selectedNode.type }}</p>
      <p><strong>Label:</strong> {{ selectedNode.label }}</p>
      <p><strong>Status:</strong> {{ selectedNode.status }}</p>
      <button @click="selectedNode = null" class="btn btn-small">Close</button>
    </div>

    <!-- Zoom info -->
    <div class="zoom-info">
      <p>Zoom: {{ Math.round(zoomLevel * 100) }}%</p>
      <p>Pan: ({{ Math.round(panX) }}, {{ Math.round(panY) }})</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePreferredDark, useLocalStorage, useClipboard } from '@vueuse/core'
import FlowChart from './components/FlowChart.vue'

// Theme management
const isDark = usePreferredDark()
const userTheme = useLocalStorage('app-theme', 'auto')
const currentTheme = computed(() => {
  if (userTheme.value === 'auto') {
    return isDark.value ? 'dark' : 'light'
  }
  return userTheme.value
})

// Clipboard for copying chart data
const { copy, copied } = useClipboard()

// State
const selectedNode = ref(null)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)

// Layout options
const layoutOptions = {
  nodeHeight: 120,
  nodeSpacing: 100, // Vertical gap between levels
  startY: 80,
  centerX: 400, // Center all nodes
  horizontalSpacing: 280, // Spacing between nodes on same level
}

// Sample chart data
const chartData = ref({
  nodes: [
    {
      id: '1',
      type: 'trigger',
      label: 'User Signup',
      status: 'success',
      ports: [
        { id: 'out1', label: 'Next', direction: 'out' },
        { id: 'out2', label: 'Start', direction: 'out' },
      ], // Multiple ports for trigger nodes
    },
    {
      id: '2',
      type: 'decision',
      label: 'Send Welcome Email?',
      status: 'pending',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'yes', label: 'Yes', direction: 'out' },
        { id: 'no', label: 'No', direction: 'out' },
        { id: 'maybe', label: 'Maybe', direction: 'out' },
        { id: 'later', label: 'Later', direction: 'out' },
      ],
    },
    {
      id: '3',
      type: 'action',
      label: 'Send Welcome Email',
      status: 'success',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'out1', label: 'Next', direction: 'out' },
        { id: 'out2', label: 'Complete', direction: 'out' },
      ],
    },
    {
      id: '4',
      type: 'action',
      label: 'Log to Database',
      status: 'warning',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'out1', label: 'Next', direction: 'out' },
        { id: 'out2', label: 'Error', direction: 'out' },
      ],
    },
    {
      id: '5',
      type: 'prompt',
      label: 'Send Reminder',
      status: 'pending',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'out1', label: 'Yes', direction: 'out' },
        { id: 'out2', label: 'No', direction: 'out' },
      ],
    },
    {
      id: '6',
      type: 'api',
      label: 'Schedule Follow-up',
      status: 'error',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'out1', label: 'Success', direction: 'out' },
        { id: 'out2', label: 'Failed', direction: 'out' },
      ],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: '1', portId: 'out1' },
      to: { nodeId: '2', portId: 'in1' },
    },
    {
      id: 'e2',
      from: { nodeId: '2', portId: 'yes' },
      to: { nodeId: '3', portId: 'in1' },
    },
    {
      id: 'e3',
      from: { nodeId: '2', portId: 'no' },
      to: { nodeId: '4', portId: 'in1' },
    },
    {
      id: 'e4',
      from: { nodeId: '2', portId: 'maybe' },
      to: { nodeId: '5', portId: 'in1' },
    },
    {
      id: 'e5',
      from: { nodeId: '2', portId: 'later' },
      to: { nodeId: '6', portId: 'in1' },
    },
  ],
})

// Functions
const addNode = () => {
  const newNodeId = `node-${Date.now()}`
  const newNode = {
    id: newNodeId,
    type: 'action',
    label: `New Action ${chartData.value.nodes.length + 1}`,
    status: 'pending',
    ports: [
      { id: 'in1', label: 'Input', direction: 'in' },
      { id: 'out1', label: 'Next', direction: 'out' },
    ],
  }

  chartData.value.nodes.push(newNode)

  // Add edge from last node to new node
  if (chartData.value.nodes.length > 1) {
    const lastNode = chartData.value.nodes[chartData.value.nodes.length - 2]
    const newEdge = {
      id: `edge-${Date.now()}`,
      from: { nodeId: lastNode.id, portId: 'out1' },
      to: { nodeId: newNodeId, portId: 'in1' },
    }
    chartData.value.edges.push(newEdge)
  }
}

const resetChart = () => {
  // Reset to original data
  chartData.value = {
    nodes: [
      {
        id: '1',
        type: 'trigger',
        label: 'User Signup',
        status: 'success',
        ports: [
          { id: 'out1', label: 'Next', direction: 'out' },
          { id: 'out2', label: 'Start', direction: 'out' },
        ],
      },
      {
        id: '2',
        type: 'decision',
        label: 'Send Welcome Email?',
        status: 'pending',
        ports: [
          { id: 'in1', label: 'Input', direction: 'in' },
          { id: 'yes', label: 'Yes', direction: 'out' },
          { id: 'no', label: 'No', direction: 'out' },
          { id: 'maybe', label: 'Maybe', direction: 'out' },
          { id: 'later', label: 'Later', direction: 'out' },
        ],
      },
      {
        id: '3',
        type: 'action',
        label: 'Send Welcome Email',
        status: 'success',
        ports: [
          { id: 'in1', label: 'Input', direction: 'in' },
          { id: 'out1', label: 'Next', direction: 'out' },
          { id: 'out2', label: 'Complete', direction: 'out' },
        ],
      },
      {
        id: '4',
        type: 'action',
        label: 'Log to Database',
        status: 'warning',
        ports: [
          { id: 'in1', label: 'Input', direction: 'in' },
          { id: 'out1', label: 'Next', direction: 'out' },
          { id: 'out2', label: 'Error', direction: 'out' },
        ],
      },
      {
        id: '5',
        type: 'prompt',
        label: 'Send Reminder',
        status: 'pending',
        ports: [
          { id: 'in1', label: 'Input', direction: 'in' },
          { id: 'out1', label: 'Yes', direction: 'out' },
          { id: 'out2', label: 'No', direction: 'out' },
        ],
      },
      {
        id: '6',
        type: 'api',
        label: 'Schedule Follow-up',
        status: 'error',
        ports: [
          { id: 'in1', label: 'Input', direction: 'in' },
          { id: 'out1', label: 'Success', direction: 'out' },
          { id: 'out2', label: 'Failed', direction: 'out' },
        ],
      },
    ],
    edges: [
      {
        id: 'e1',
        from: { nodeId: '1', portId: 'out1' },
        to: { nodeId: '2', portId: 'in1' },
      },
      {
        id: 'e2',
        from: { nodeId: '2', portId: 'yes' },
        to: { nodeId: '3', portId: 'in1' },
      },
      {
        id: 'e3',
        from: { nodeId: '2', portId: 'no' },
        to: { nodeId: '4', portId: 'in1' },
      },
      {
        id: 'e4',
        from: { nodeId: '2', portId: 'maybe' },
        to: { nodeId: '5', portId: 'in1' },
      },
      {
        id: 'e5',
        from: { nodeId: '2', portId: 'later' },
        to: { nodeId: '6', portId: 'in1' },
      },
    ],
  }
}

const toggleTheme = () => {
  userTheme.value = userTheme.value === 'dark' ? 'light' : 'dark'
}

const handleNodeClick = (nodeData) => {
  selectedNode.value = nodeData
  console.log('Node clicked:', nodeData)
}

const handleEdgeClick = (edgeData) => {
  console.log('Edge clicked:', edgeData)
}

const handleZoomChange = (zoomData) => {
  zoomLevel.value = zoomData.scale
  console.log('Zoom changed:', zoomData)
}

const handlePanChange = (panData) => {
  panX.value = panData.x
  panY.value = panData.y
  console.log('Pan changed:', panData)
}

// Copy chart data to clipboard
const copyChartData = () => {
  copy(JSON.stringify(chartData.value, null, 2))
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-controls {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: white;
  transform: translateY(-1px);
}

.btn-theme {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.app-main {
  flex: 1;
  position: relative;
}

/* Custom node content styles */
.custom-trigger-content,
.custom-decision-content,
.custom-action-content {
  text-align: center;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.custom-trigger-content p,
.custom-decision-content p,
.custom-action-content p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.custom-trigger-content small,
.custom-decision-content small,
.custom-action-content small {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

/* Info panel */
.info-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  z-index: 1000;
}

.info-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #333;
}

.info-panel p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}

/* Zoom info */
.zoom-info {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  color: #666;
  z-index: 1000;
}

.zoom-info p {
  margin: 0.25rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }

  .header-controls {
    width: 100%;
    justify-content: center;
  }

  .info-panel {
    top: 80px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .zoom-info {
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
}
</style>

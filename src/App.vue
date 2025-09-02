<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue Flowchart Engine</h1>
      <div class="header-controls">
        <button @click="toggleSidebar" class="btn btn-secondary">
          {{ sidebarCollapsed ? '📋' : '📋' }}
        </button>
        <button @click="addNode" class="btn btn-primary">Add Node</button>
        <button @click="resetChart" class="btn btn-secondary">Reset</button>
        <button @click="toggleTheme" class="btn btn-theme">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <div class="app-layout">
      <!-- Sidebar -->
      <Sidebar
        :collapsed="sidebarCollapsed"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />

      <!-- Main content -->
      <main class="app-main">
        <FlowChart
          :data="chartData"
          :layout-options="layoutOptions"
          :show-zoom-controls="true"
          :enable-zoom="true"
          :enable-pan="true"
          :dragged-template="draggedTemplate"
          @node-click="handleNodeClick"
          @edge-click="handleEdgeClick"
          @zoom-change="handleZoomChange"
          @pan-change="handlePanChange"
          @node-drop="handleNodeDrop"
        >
          <!-- Custom node slots -->
          <template #node-trigger="{ node }">
            <div class="custom-trigger-content">
              <p>🚀 {{ node.label }}</p>
              <small>Start Process</small>
            </div>
          </template>

          <template #node-prompt="{ node }">
            <div class="custom-prompt-content">
              <p>❓ {{ node.label }}</p>
              <small>Yes / No Decision</small>
            </div>
          </template>

          <template #node-action="{ node }">
            <div class="custom-action-content">
              <p>⚡ {{ node.label }}</p>
              <small>Action Item</small>
            </div>
          </template>
        </FlowChart>
      </main>
    </div>

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
import Sidebar from './components/Sidebar.vue'

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
const sidebarCollapsed = ref(false)
const draggedTemplate = ref(null)

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
      label: 'Trigger',
      status: 'success',
      ports: [{ id: 'out1', label: 'Start', direction: 'out' }],
    },
    {
      id: '2',
      type: 'action',
      label: 'Action 1',
      status: 'success',
      ports: [],
    },
    {
      id: '3',
      type: 'action',
      label: 'Action 2',
      status: 'success',
      ports: [],
    },
    {
      id: '4',
      type: 'prompt',
      label: 'Prompt',
      status: 'pending',
      ports: [
        { id: 'yes', label: 'Yes', direction: 'out' },
        { id: 'no', label: 'No', direction: 'out' },
      ],
    },
    {
      id: '5',
      type: 'action',
      label: 'Yes Action',
      status: 'success',
      ports: [],
    },
    {
      id: '6',
      type: 'action',
      label: 'No Action',
      status: 'success',
      ports: [],
    },
  ],
  edges: [
    {
      id: 'e1',
      from: { nodeId: '1', portId: 'out1' },
      to: { nodeId: '2' },
      label: '',
    },
    {
      id: 'e2',
      from: { nodeId: '2' },
      to: { nodeId: '3' },
      label: '',
    },
    {
      id: 'e3',
      from: { nodeId: '3' },
      to: { nodeId: '4' },
      label: '',
    },
    {
      id: 'e4',
      from: { nodeId: '4', portId: 'yes' },
      to: { nodeId: '5' },
      label: 'Yes',
    },
    {
      id: 'e5',
      from: { nodeId: '4', portId: 'no' },
      to: { nodeId: '6' },
      label: 'No',
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
    ports: [],
  }

  chartData.value.nodes.push(newNode)

  // Add edge from last node to new node
  if (chartData.value.nodes.length > 1) {
    const lastNode = chartData.value.nodes[chartData.value.nodes.length - 2]
    const newEdge = {
      id: `edge-${Date.now()}`,
      from: { nodeId: lastNode.id },
      to: { nodeId: newNodeId },
      label: '',
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
        label: 'Trigger',
        status: 'success',
        ports: [{ id: 'out1', label: 'Start', direction: 'out' }],
      },
      {
        id: '2',
        type: 'action',
        label: 'Action 1',
        status: 'success',
        ports: [],
      },
      {
        id: '3',
        type: 'action',
        label: 'Action 2',
        status: 'success',
        ports: [],
      },
      {
        id: '4',
        type: 'prompt',
        label: 'Prompt',
        status: 'pending',
        ports: [
          { id: 'yes', label: 'Yes', direction: 'out' },
          { id: 'no', label: 'No', direction: 'out' },
        ],
      },
      {
        id: '5',
        type: 'action',
        label: 'Yes Action',
        status: 'success',
        ports: [],
      },
      {
        id: '6',
        type: 'action',
        label: 'No Action',
        status: 'success',
        ports: [],
      },
    ],
    edges: [
      {
        id: 'e1',
        from: { nodeId: '1', portId: 'out1' },
        to: { nodeId: '2' },
        label: '',
      },
      {
        id: 'e2',
        from: { nodeId: '2' },
        to: { nodeId: '3' },
        label: '',
      },
      {
        id: 'e3',
        from: { nodeId: '3' },
        to: { nodeId: '4' },
        label: '',
      },
      {
        id: 'e4',
        from: { nodeId: '4', portId: 'yes' },
        to: { nodeId: '5' },
        label: 'Yes',
      },
      {
        id: 'e5',
        from: { nodeId: '4', portId: 'no' },
        to: { nodeId: '6' },
        label: 'No',
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

// Drag and drop handlers
const handleDragStart = (nodeTemplate) => {
  console.log('Drag started:', nodeTemplate)
  // Store the dragged template for the FlowChart component
  draggedTemplate.value = nodeTemplate
}

const handleDragEnd = () => {
  console.log('Drag ended')
  // Clear the dragged template
  draggedTemplate.value = null
}

const handleNodeDrop = (dropData) => {
  const { template, position } = dropData

  // Find the best position for the new node
  const { bestPosition, sourceNode, targetNode } =
    findBestNodePosition(position)

  // Create new node from template
  const newNodeId = `node-${Date.now()}`
  const newNode = {
    id: newNodeId,
    type: template.type,
    label: template.label,
    status: 'pending',
    ports: template.ports || [],
    position: bestPosition,
  }

  // Add node to chart data
  chartData.value.nodes.push(newNode)

  // Create edges to connect the new node
  createConnectingEdges(newNode, sourceNode, targetNode)

  console.log('Node dropped and connected:', newNode)
}

// Find the best position for a new node based on drop location
const findBestNodePosition = (dropPosition) => {
  const nodes = chartData.value.nodes
  const edges = chartData.value.edges

  // Find the closest node to the drop position
  let closestNode = null
  let minDistance = Infinity

  nodes.forEach((node) => {
    if (node.position) {
      const distance = Math.sqrt(
        Math.pow(node.position.x - dropPosition.x, 2) +
          Math.pow(node.position.y - dropPosition.y, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        closestNode = node
      }
    }
  })

  if (!closestNode) {
    // If no nodes exist, place at drop position
    return {
      bestPosition: dropPosition,
      sourceNode: null,
      targetNode: null,
    }
  }

  // Determine if we should place above or below the closest node
  const isAbove = dropPosition.y < closestNode.position.y
  const verticalOffset = 120 + 100 // node height + spacing

  let bestPosition
  let sourceNode
  let targetNode

  if (isAbove) {
    // Place above the closest node
    bestPosition = {
      x: closestNode.position.x,
      y: closestNode.position.y - verticalOffset,
    }
    sourceNode = null
    targetNode = closestNode

    // Find the node that connects TO the closest node
    const incomingEdge = edges.find((edge) => edge.to.nodeId === closestNode.id)
    if (incomingEdge) {
      sourceNode = nodes.find((n) => n.id === incomingEdge.from.nodeId)
    }
  } else {
    // Place below the closest node
    bestPosition = {
      x: closestNode.position.x,
      y: closestNode.position.y + verticalOffset,
    }
    sourceNode = closestNode
    targetNode = null

    // Find the node that the closest node connects TO
    const outgoingEdge = edges.find(
      (edge) => edge.from.nodeId === closestNode.id
    )
    if (outgoingEdge) {
      targetNode = nodes.find((n) => n.id === outgoingEdge.to.nodeId)
    }
  }

  // Check if there are other nodes at the same level and adjust X position
  const nodesAtSameLevel = nodes.filter(
    (node) => node.position && Math.abs(node.position.y - bestPosition.y) < 50
  )

  if (nodesAtSameLevel.length > 0) {
    // Find the rightmost node at this level
    const rightmostNode = nodesAtSameLevel.reduce((rightmost, current) => {
      if (!rightmost || current.position.x > rightmost.position.x) {
        return current
      }
      return rightmost
    })

    // Place the new node to the right of the rightmost node
    if (rightmostNode) {
      bestPosition.x =
        rightmostNode.position.x + (rightmostNode.width || 200) + 100
    }
  }

  return { bestPosition, sourceNode, targetNode }
}

// Create edges to connect the new node
const createConnectingEdges = (newNode, sourceNode, targetNode) => {
  const edges = chartData.value.edges

  if (sourceNode) {
    // Connect source node to new node
    const sourceEdge = {
      id: `edge-${Date.now()}-1`,
      from: { nodeId: sourceNode.id },
      to: { nodeId: newNode.id },
      label: '',
    }
    edges.push(sourceEdge)

    // Remove the old edge from source to target (if it exists)
    const oldEdgeIndex = edges.findIndex(
      (edge) =>
        edge.from.nodeId === sourceNode.id && edge.to.nodeId === targetNode?.id
    )
    if (oldEdgeIndex !== -1) {
      edges.splice(oldEdgeIndex, 1)
    }
  }

  if (targetNode) {
    // Connect new node to target node
    const targetEdge = {
      id: `edge-${Date.now()}-2`,
      from: { nodeId: newNode.id },
      to: { nodeId: targetNode.id },
      label: '',
    }
    edges.push(targetEdge)
  }
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
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

.app-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 80px); /* Account for header height */
}

.app-main {
  flex: 1;
  position: relative;
}

/* Custom node content styles */
.custom-trigger-content,
.custom-prompt-content,
.custom-action-content {
  text-align: center;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.custom-trigger-content p,
.custom-prompt-content p,
.custom-action-content p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.custom-trigger-content small,
.custom-prompt-content small,
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

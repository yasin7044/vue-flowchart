<template>
  <div
    class="node"
    :class="[
      `node-${type}`,
      { 'node-hover': isHovered, 'node-selected': isSelected },
    ]"
    :style="nodeStyle"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    ref="nodeRef"
  >
    <!-- Node Header with Icon -->
    <div class="node-header">
      <div class="node-icon">
        <slot name="icon">
          <div class="default-icon" :class="`icon-${type}`">
            {{ getDefaultIcon(type) }}
          </div>
        </slot>
      </div>
      <div class="node-info">
        <h3 class="node-title">{{ label }}</h3>
        <span class="node-type-badge" :class="`badge-${type}`">{{ type }}</span>
      </div>
    </div>

    <!-- Node Content -->
    <div class="node-content">
      <slot>
        <div class="node-default-content">
          <p class="node-description">{{ getDefaultDescription(type) }}</p>
        </div>
      </slot>
    </div>

    <!-- Node Ports -->
    <div
      class="node-ports"
      :class="{ 'ports-horizontal': type === 'decision' }"
    >
      <div
        v-for="port in ports"
        :key="port.id"
        class="node-port"
        :class="[`port-${port.direction}`, { 'port-hover': isHovered }]"
        @click.stop="handlePortClick(port)"
        @mouseenter="handlePortHover(port, true)"
        @mouseleave="handlePortHover(port, false)"
      >
        <span class="port-label">{{ port.label || port.id }}</span>
      </div>
    </div>

    <!-- Node Status Indicator -->
    <div class="node-status" v-if="status">
      <div class="status-indicator" :class="`status-${status}`"></div>
    </div>

    <!-- Context Menu Trigger -->
    <div
      class="context-menu-trigger"
      @click.stop="showContextMenu = true"
      v-if="enableContextMenu"
    >
      <span>⋮</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import {
  useElementSize,
  useIntersectionObserver,
  useEventListener,
  useThrottleFn,
  useLocalStorage,
  usePreferredDark,
  useClipboard,
  useVModel,
} from '@vueuse/core'

const props = defineProps({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  ports: { type: Array, default: () => [] },
  status: {
    type: String,
    default: '',
    validator: (value) =>
      ['success', 'error', 'warning', 'pending', ''].includes(value),
  },
  theme: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'dark', 'minimal', 'colorful'].includes(value),
  },
  node: {
    type: Object,
    default: () => ({}),
  },
  enableContextMenu: {
    type: Boolean,
    default: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'port-click', 'port-hover', 'context-menu'])

// Node ref for size tracking
const nodeRef = ref(null)
const { width: nodeWidth, height: nodeHeight } = useElementSize(nodeRef)

// State
const isHovered = ref(false)
const isSelected = useVModel(props, 'selected', emit)
const showContextMenu = ref(false)

// Intersection observer for performance
const { stop } = useIntersectionObserver(nodeRef, ([{ isIntersecting }]) => {
  // Only render when visible for better performance
  if (!isIntersecting) {
    // Node is not visible, could implement lazy loading here
  }
})

// Local storage for node preferences
const nodePreferences = useLocalStorage(`node-${props.id}-preferences`, {
  collapsed: false,
  customTheme: null,
})

// Theme detection
const isDark = usePreferredDark()
const effectiveTheme = computed(() => {
  if (nodePreferences.value.customTheme) {
    return nodePreferences.value.customTheme
  }
  if (props.theme === 'default') {
    return isDark.value ? 'dark' : 'light'
  }
  return props.theme
})

// Clipboard for copying node data
const { copy, copied } = useClipboard()

// Calculate dynamic width based on number of output ports
const nodeStyle = computed(() => {
  // Use the calculated width from the layout engine
  const nodeWidth = props.node?.width || 200

  if (props.type === 'decision') {
    const outputPorts = props.ports.filter((port) => port.direction === 'out')
    const minWidth = 200
    const portWidth = 120
    const padding = 40
    const calculatedWidth = Math.max(
      minWidth,
      outputPorts.length * portWidth + padding
    )
    return {
      minWidth: `${calculatedWidth}px`,
      width: `${calculatedWidth}px`,
      maxWidth: `${calculatedWidth}px`,
    }
  }

  return {
    minWidth: `${nodeWidth}px`,
    width: `${nodeWidth}px`,
    maxWidth: `${nodeWidth}px`,
  }
})

// Helper functions
const getDefaultIcon = (type) => {
  const icons = {
    trigger: '🚀',
    decision: '❓',
    action: '⚡',
    prompt: '💬',
    api: '🌐',
  }
  return icons[type] || '📋'
}

const getDefaultDescription = (type) => {
  const descriptions = {
    trigger: '',
    decision: 'Makes a decision',
    action: 'Performs an action',
    prompt: 'Requests user input',
    api: 'Calls external API',
  }
  return descriptions[type] || 'Node description'
}

// Event handlers
const handleClick = () => {
  emit('click', { id: props.id, type: props.type, label: props.label })
}

const handlePortClick = (port) => {
  emit('port-click', { nodeId: props.id, port })
}

const handlePortHover = (port, isHovering) => {
  emit('port-hover', { nodeId: props.id, port, isHovering })
}

// Context menu functionality
const copyNodeData = () => {
  const nodeData = {
    id: props.id,
    type: props.type,
    label: props.label,
    ports: props.ports,
    status: props.status,
  }
  copy(JSON.stringify(nodeData, null, 2))
}

const toggleCollapse = () => {
  nodePreferences.value.collapsed = !nodePreferences.value.collapsed
}

// Keyboard shortcuts
useEventListener(nodeRef, 'keydown', (event) => {
  if (event.key === 'Delete' && isSelected.value) {
    // Handle delete
    event.preventDefault()
  }
  if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
    copyNodeData()
    event.preventDefault()
  }
})

// Watch for theme changes
watch(
  effectiveTheme,
  (newTheme) => {
    // Apply theme-specific styles
    if (nodeRef.value) {
      nodeRef.value.setAttribute('data-theme', newTheme)
    }
  },
  { immediate: true }
)

// Cleanup
onUnmounted(() => {
  stop()
})
</script>

<style scoped>
.node {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  user-select: none;
}

.node:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.node-selected {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Node types */
.node-trigger {
  border-color: #28a745;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.node-decision {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.node-action {
  border-color: #007bff;
  background: linear-gradient(135deg, #cce7ff 0%, #b3d9ff 100%);
}

.node-prompt {
  border-color: #6f42c1;
  background: linear-gradient(135deg, #e2d9f3 0%, #d1c4e9 100%);
}

.node-api {
  border-color: #fd7e14;
  background: linear-gradient(135deg, #ffe8d1 0%, #ffd8a8 100%);
}

/* Node header */
.node-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.node-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-trigger {
  background: #28a745;
  color: white;
}

.badge-decision {
  background: #ffc107;
  color: #212529;
}

.badge-action {
  background: #007bff;
  color: white;
}

.badge-prompt {
  background: #6f42c1;
  color: white;
}

.badge-api {
  background: #fd7e14;
  color: white;
}

/* Node content */
.node-content {
  flex: 1;
  margin-bottom: 12px;
}

.node-default-content {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}

/* Node ports */
.node-ports {
  display: flex;
  justify-content: center;
  gap: 12px;
  position: absolute;
  bottom: -16px; /* Position at the bottom border of the node */
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: none; /* Allow clicks to pass through to ports */
  padding: 0; /* Remove any padding */
}

.node-ports.ports-horizontal {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.node-port {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid #ffffff;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: relative;
  min-width: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 25;
  pointer-events: auto; /* Re-enable clicks on individual ports */
}

.node-port::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s ease;
}

.node-port:hover::before {
  left: 100%;
}

.node-port:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.port-in {
  border-color: #28a745;
  background: linear-gradient(
    135deg,
    rgba(40, 167, 69, 0.1) 0%,
    rgba(40, 167, 69, 0.05) 100%
  );
}

.port-in:hover {
  border-color: #1e7e34;
  background: linear-gradient(
    135deg,
    rgba(40, 167, 69, 0.2) 0%,
    rgba(40, 167, 69, 0.1) 100%
  );
}

.port-out {
  border-color: #007bff;
  background: white;
}

.port-out:hover {
  border-color: #0056b3;
  background: linear-gradient(
    135deg,
    rgba(0, 123, 255, 0.2) 0%,
    rgba(0, 123, 255, 0.1) 100%
  );
}

.port-label {
  font-size: 11px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.port-in .port-label {
  color: #155724;
}

.port-out .port-label {
  color: #004085;
}

.node-port:hover .port-label {
  color: #212529;
}

/* Status indicator */
.node-status {
  position: absolute;
  top: 8px;
  right: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.status-success {
  background: #28a745;
}

.status-error {
  background: #dc3545;
}

.status-warning {
  background: #ffc107;
}

.status-pending {
  background: #6c757d;
}

/* Context menu trigger */
.context-menu-trigger {
  position: absolute;
  top: 8px;
  right: 24px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #6c757d;
  font-size: 16px;
  font-weight: bold;
}

.node:hover .context-menu-trigger {
  opacity: 1;
}

.context-menu-trigger:hover {
  color: #007bff;
}

/* Theme variations */
.node[data-theme='dark'] {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-color: #4a5568;
  color: #e2e8f0;
}

.node[data-theme='dark'] .node-title {
  color: #e2e8f0;
}

.node[data-theme='dark'] .node-default-content {
  color: #a0aec0;
}

.node[data-theme='minimal'] {
  background: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node[data-theme='colorful'] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #4c51bf;
  color: white;
}

.node[data-theme='colorful'] .node-title {
  color: white;
}

.node[data-theme='colorful'] .node-default-content {
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive design */
@media (max-width: 768px) {
  .node {
    min-width: 160px;
    padding: 12px;
  }

  .node-header {
    gap: 8px;
  }

  .node-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .node-title {
    font-size: 14px;
  }

  .node-ports {
    gap: 8px;
    padding-top: 8px;
  }

  .node-port {
    padding: 6px 12px;
    min-width: 50px;
  }

  .port-label {
    font-size: 10px;
    max-width: 60px;
  }
}
</style>

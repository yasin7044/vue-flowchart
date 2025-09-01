<template>
  <svg class="edge-svg" :style="svgStyle" @click="handleClick">
    <path
      :d="pathData"
      class="edge-path"
      :class="edgeClasses"
      fill="none"
      stroke-width="2"
    />
    <!-- Edge label -->
    <text
      v-if="label"
      :x="labelPosition.x"
      :y="labelPosition.y"
      class="edge-label"
      text-anchor="middle"
      dominant-baseline="middle"
    >
      {{ label }}
    </text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fromNodeId: {
    type: String,
    required: true,
  },
  fromPortId: {
    type: String,
    required: true,
  },
  toNodeId: {
    type: String,
    required: true,
  },
  toPortId: {
    type: String,
    required: true,
  },
  fromPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  toPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  type: {
    type: String,
    default: 'default',
  },
  label: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

// Calculate SVG dimensions and positioning
const svgStyle = computed(() => {
  const minX = Math.min(props.fromPosition.x, props.toPosition.x) - 10
  const minY = Math.min(props.fromPosition.y, props.toPosition.y) - 10
  const width = Math.abs(props.toPosition.x - props.fromPosition.x) + 20
  const height = Math.abs(props.toPosition.y - props.fromPosition.y) + 20

  return {
    position: 'absolute',
    left: `${minX}px`,
    top: `${minY}px`,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
  }
})

// Calculate relative positions within SVG
const startX = computed(() => {
  return (
    props.fromPosition.x -
    (Math.min(props.fromPosition.x, props.toPosition.x) - 10)
  )
})

const startY = computed(() => {
  return (
    props.fromPosition.y -
    (Math.min(props.fromPosition.y, props.toPosition.y) - 10)
  )
})

const endX = computed(() => {
  return (
    props.toPosition.x -
    (Math.min(props.fromPosition.x, props.toPosition.x) - 10)
  )
})

const endY = computed(() => {
  return (
    props.toPosition.y -
    (Math.min(props.fromPosition.y, props.toPosition.y) - 10)
  )
})

// Generate clean SVG path
const pathData = computed(() => {
  const x1 = startX.value
  const y1 = startY.value
  const x2 = endX.value
  const y2 = endY.value

  // Calculate control points for smooth bezier curve
  const midY = (y1 + y2) / 2
  const horizontalDistance = Math.abs(x2 - x1)

  // For port-to-node connections, use a more direct curve
  const controlOffset = Math.max(horizontalDistance * 0.2, 30) // Reduced offset for cleaner connections

  // Use smooth bezier curve for better visual appeal
  return `M ${x1} ${y1} C ${x1} ${midY - controlOffset} ${x2} ${
    midY + controlOffset
  } ${x2} ${y2}`
})

const edgeClasses = computed(() => {
  return {
    'edge-default': props.type === 'default',
    'edge-success': props.type === 'success',
    'edge-error': props.type === 'error',
    'edge-warning': props.type === 'warning',
  }
})

// Calculate label position (middle of the edge)
const labelPosition = computed(() => {
  // Calculate the middle point between from and to positions
  const midX = (props.fromPosition.x + props.toPosition.x) / 2
  const midY = (props.fromPosition.y + props.toPosition.y) / 2

  // Convert to SVG coordinates (relative to SVG container)
  const minX = Math.min(props.fromPosition.x, props.toPosition.x) - 10
  const minY = Math.min(props.fromPosition.y, props.toPosition.y) - 10

  return {
    x: midX - minX,
    y: midY - minY - 10, // Offset slightly above the line
  }
})

const handleClick = (event) => {
  event.stopPropagation()
  emit('click', {
    fromNodeId: props.fromNodeId,
    fromPortId: props.fromPortId,
    toNodeId: props.toNodeId,
    toPortId: props.toPortId,
  })
}
</script>

<style scoped>
.edge-svg {
  z-index: 1;
  pointer-events: auto;
}

.edge-path {
  stroke: #6c757d;
  transition: all 0.2s ease;
  cursor: pointer;
}

.edge-path:hover {
  stroke-width: 3;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.edge-default {
  stroke: #6c757d;
}

.edge-success {
  stroke: #28a745;
}

.edge-error {
  stroke: #dc3545;
}

.edge-warning {
  stroke: #ffc107;
}

.edge-path:hover {
  stroke: #007bff;
}

.edge-label {
  font-size: 12px;
  font-weight: 600;
  fill: #333333;
  pointer-events: none;
}
</style>

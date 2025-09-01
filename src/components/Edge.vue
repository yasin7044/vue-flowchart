<template>
  <svg class="edge-svg" :style="svgStyle" @click="handleClick">
    <path
      :d="pathData"
      class="edge-path"
      :class="edgeClasses"
      fill="none"
      stroke-width="2"
    />
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

// Generate straight SVG path
const pathData = computed(() => {
  const x1 = startX.value
  const y1 = startY.value
  const x2 = endX.value
  const y2 = endY.value

  // Calculate control points for smooth bezier curve
  const midY = (y1 + y2) / 2
  const horizontalDistance = Math.abs(x2 - x1)
  const controlOffset = Math.max(horizontalDistance * 0.3, 50) // Minimum 50px offset

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
</style>

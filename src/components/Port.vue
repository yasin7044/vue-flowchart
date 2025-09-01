<template>
  <div class="port" :class="`port-${direction}`" @click="handleClick">
    <slot>
      <div class="port-default">
        <div class="port-circle" :class="`circle-${direction}`"></div>
        <span class="port-label">{{ label }}</span>
      </div>
    </slot>
  </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    required: true,
    validator: (value) => ['in', 'out'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click', 'connect'])

const handleClick = () => {
  emit('click', {
    id: props.id,
    direction: props.direction,
    label: props.label,
  })
}
</script>

<style scoped>
.port {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.port:hover {
  background: #e9ecef;
  border-color: #007bff;
  transform: scale(1.05);
}

.port-in {
  justify-content: flex-start;
}

.port-out {
  justify-content: flex-end;
}

.port-default {
  display: flex;
  align-items: center;
  gap: 8px;
}

.port-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #007bff;
  transition: all 0.2s ease;
}

.circle-in {
  background: #28a745;
  box-shadow: 0 0 0 2px #28a745;
}

.circle-out {
  background: #007bff;
  box-shadow: 0 0 0 2px #007bff;
}

.port:hover .port-circle {
  transform: scale(1.2);
}

.port-label {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.port-in .port-label {
  margin-left: 4px;
}

.port-out .port-label {
  margin-right: 4px;
}
</style>

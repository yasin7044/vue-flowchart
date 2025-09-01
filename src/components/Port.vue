<template>
  <div class="port" :class="`port-${direction}`" @click="handleClick">
    <slot>
      <div class="port-default">
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
  justify-content: center;
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  position: relative;
  min-width: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.port::before {
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

.port:hover::before {
  left: 100%;
}

.port:hover {
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
  background: linear-gradient(
    135deg,
    rgba(0, 123, 255, 0.1) 0%,
    rgba(0, 123, 255, 0.05) 100%
  );
}

.port-out:hover {
  border-color: #0056b3;
  background: linear-gradient(
    135deg,
    rgba(0, 123, 255, 0.2) 0%,
    rgba(0, 123, 255, 0.1) 100%
  );
}

.port-default {
  display: flex;
  align-items: center;
  justify-content: center;
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

.port:hover .port-label {
  color: #212529;
}
</style>

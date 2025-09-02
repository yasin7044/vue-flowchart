<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <h3>Node Library</h3>
      <button
        @click="toggleCollapse"
        class="collapse-btn"
        :title="isCollapsed ? 'Expand' : 'Collapse'"
      >
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>

    <div class="sidebar-content" v-if="!isCollapsed">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search nodes..."
          class="search-input"
        />
      </div>

      <div class="node-categories">
        <div
          v-for="category in filteredCategories"
          :key="category.name"
          class="node-category"
        >
          <h4 class="category-title">{{ category.name }}</h4>
          <div class="category-nodes">
            <div
              v-for="nodeTemplate in category.nodes"
              :key="nodeTemplate.type"
              class="node-template"
              draggable="true"
              @dragstart="handleDragStart($event, nodeTemplate)"
              @dragend="handleDragEnd"
            >
              <div class="template-icon">{{ nodeTemplate.icon }}</div>
              <div class="template-info">
                <div class="template-name">{{ nodeTemplate.label }}</div>
                <div class="template-description">
                  {{ nodeTemplate.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['drag-start', 'drag-end'])

const isCollapsed = ref(props.collapsed)
const searchQuery = ref('')

// Node templates organized by category
const nodeCategories = [
  {
    name: 'Triggers',
    nodes: [
      {
        type: 'trigger',
        label: 'Trigger',
        description: 'Start of workflow',
        icon: '🚀',
        ports: [{ id: 'out1', label: 'Start', direction: 'out' }],
      },
      {
        type: 'webhook',
        label: 'Webhook',
        description: 'HTTP endpoint trigger',
        icon: '🌐',
        ports: [{ id: 'out1', label: 'Trigger', direction: 'out' }],
      },
      {
        type: 'schedule',
        label: 'Schedule',
        description: 'Time-based trigger',
        icon: '⏰',
        ports: [{ id: 'out1', label: 'Time', direction: 'out' }],
      },
    ],
  },
  {
    name: 'Actions',
    nodes: [
      {
        type: 'action',
        label: 'Action',
        description: 'Perform an action',
        icon: '⚡',
        ports: [],
      },
      {
        type: 'api',
        label: 'API Call',
        description: 'Call external API',
        icon: '🔌',
        ports: [],
      },
      {
        type: 'email',
        label: 'Send Email',
        description: 'Send email notification',
        icon: '📧',
        ports: [],
      },
      {
        type: 'sms',
        label: 'Send SMS',
        description: 'Send SMS notification',
        icon: '📱',
        ports: [],
      },
      {
        type: 'database',
        label: 'Database',
        description: 'Database operation',
        icon: '🗄️',
        ports: [],
      },
      {
        type: 'file',
        label: 'File Operation',
        description: 'File read/write operation',
        icon: '📁',
        ports: [],
      },
    ],
  },
  {
    name: 'Decisions',
    nodes: [
      {
        type: 'prompt',
        label: 'Prompt',
        description: 'User decision point',
        icon: '❓',
        ports: [
          { id: 'yes', label: 'Yes', direction: 'out' },
          { id: 'no', label: 'No', direction: 'out' },
        ],
      },
      {
        type: 'condition',
        label: 'Condition',
        description: 'Data-based decision',
        icon: '🔀',
        ports: [
          { id: 'true', label: 'True', direction: 'out' },
          { id: 'false', label: 'False', direction: 'out' },
        ],
      },
    ],
  },
  {
    name: 'Data',
    nodes: [
      {
        type: 'transform',
        label: 'Transform',
        description: 'Transform data',
        icon: '🔄',
        ports: [],
      },
      {
        type: 'filter',
        label: 'Filter',
        description: 'Filter data',
        icon: '🔍',
        ports: [],
      },
      {
        type: 'aggregate',
        label: 'Aggregate',
        description: 'Aggregate data',
        icon: '📊',
        ports: [],
      },
    ],
  },
]

// Filter categories based on search query
const filteredCategories = computed(() => {
  if (!searchQuery.value) return nodeCategories

  return nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          node.description
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          node.type.toLowerCase().includes(searchQuery.value.toLowerCase())
      ),
    }))
    .filter((category) => category.nodes.length > 0)
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleDragStart = (event, nodeTemplate) => {
  // Set drag data
  event.dataTransfer.setData('application/json', JSON.stringify(nodeTemplate))
  event.dataTransfer.effectAllowed = 'copy'

  // Emit drag start event
  emit('drag-start', nodeTemplate)

  // Add visual feedback
  event.target.style.opacity = '0.5'
}

const handleDragEnd = (event) => {
  // Remove visual feedback
  event.target.style.opacity = '1'

  // Emit drag end event
  emit('drag-end')
}
</script>

<style scoped>
.sidebar {
  width: 300px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
}

.collapse-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #666;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.node-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.node-category {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 0.5rem;
}

.category-nodes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-template {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.node-template:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 123, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-template:active {
  cursor: grabbing;
}

.template-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  flex-shrink: 0;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-description {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Collapsed state styles */
.sidebar-collapsed .sidebar-header h3,
.sidebar-collapsed .sidebar-content,
.sidebar-collapsed .search-box,
.sidebar-collapsed .node-categories {
  display: none;
}

.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 1rem 0.5rem;
}

.sidebar-collapsed .collapse-btn {
  transform: rotate(180deg);
}

/* Responsive design */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .sidebar-collapsed {
    width: 100%;
    max-height: 60px;
  }

  .sidebar-collapsed .sidebar-content {
    display: none;
  }
}

/* Scrollbar styling */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

# Vue Flowchart Engine

> ⚡ A beautiful, extensible **flowchart engine in Vue 3** with auto-layout, dynamic ports, edges, and full slot-based customization.
> Build triggers, actions, decision nodes, and multi-port flows with modern, responsive design.

[![npm version](https://badge.fury.io/js/vue-flowchart-engine.svg)](https://badge.fury.io/js/vue-flowchart-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🎯 **Vue 3 + Composition API** powered
- 🎨 **Beautiful, modern design** with smooth animations
- 🔌 **Dynamic nodes with multiple ports** (in/out)
- 🔄 **Auto-layout with branching support**
- 🧩 **Multiple node types**: Trigger, Action, Decision, Prompt, and more
- 🎨 **4 built-in themes**: Default, Dark, Minimal, Colorful
- 📱 **Responsive design** with hover effects
- 🎯 **Status indicators** for node states
- 📦 **Fully customizable** via slots and props
- 🔧 **TypeScript support** (optional)

---

## 🚀 Quick Start

### Installation

```bash
npm install vue-flowchart-engine
# or
yarn add vue-flowchart-engine
# or
pnpm add vue-flowchart-engine
```

### Basic Usage

```vue
<template>
  <div>
    <FlowChart :data="chartData" @node-click="handleNodeClick" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FlowChart } from 'vue-flowchart-engine'

const chartData = ref({
  nodes: [
    {
      id: '1',
      type: 'trigger',
      label: 'User Signup',
      ports: [{ id: 'out1', label: 'Next', direction: 'out' }],
    },
    {
      id: '2',
      type: 'decision',
      label: 'Send Welcome Email?',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'yes', label: 'Yes', direction: 'out' },
        { id: 'no', label: 'No', direction: 'out' },
      ],
    },
    {
      id: '3',
      type: 'action',
      label: 'Send Welcome Email',
      ports: [{ id: 'in1', label: 'Input', direction: 'in' }],
    },
  ],
  edges: [
    {
      from: { nodeId: '1', portId: 'out1' },
      to: { nodeId: '2', portId: 'in1' },
    },
    {
      from: { nodeId: '2', portId: 'yes' },
      to: { nodeId: '3', portId: 'in1' },
    },
  ],
})

const handleNodeClick = (nodeData) => {
  console.log('Node clicked:', nodeData)
}
</script>
```

---

## 🎨 Node Types & Customization

### Built-in Node Types

| Type        | Icon | Description         | Color  |
| ----------- | ---- | ------------------- | ------ |
| `trigger`   | 🚀   | Starts the workflow | Green  |
| `action`    | ⚡   | Performs an action  | Blue   |
| `decision`  | ❓   | Makes a decision    | Orange |
| `prompt`    | 💬   | Asks for user input | Purple |
| `condition` | 🔀   | Checks a condition  | Teal   |
| `delay`     | ⏱️   | Waits for a period  | Yellow |
| `webhook`   | 🔗   | Sends webhook data  | Gray   |
| `email`     | 📧   | Sends an email      | Red    |
| `sms`       | 📱   | Sends an SMS        | Pink   |
| `database`  | 💾   | Database operation  | Brown  |
| `api`       | 🌐   | API call            | Cyan   |

### Custom Node Content

```vue
<template>
  <FlowChart :data="chartData">
    <!-- Custom trigger node -->
    <template #node-trigger="{ node }">
      <div class="custom-trigger">
        <div class="trigger-icon">🎯</div>
        <h4>{{ node.label }}</h4>
        <p>Custom trigger content</p>
      </div>
    </template>

    <!-- Custom action node -->
    <template #node-action="{ node }">
      <div class="custom-action">
        <div class="action-icon">⚡</div>
        <h4>{{ node.label }}</h4>
        <button class="action-btn">Execute</button>
      </div>
    </template>
  </FlowChart>
</template>
```

### Node Themes

```vue
<template>
  <FlowChart :data="chartData">
    <!-- Apply themes to specific nodes -->
    <template #node-trigger="{ node }">
      <Node
        :id="node.id"
        :type="node.type"
        :label="node.label"
        :ports="node.ports"
        theme="colorful"
      />
    </template>
  </FlowChart>
</template>
```

Available themes: `default`, `dark`, `minimal`, `colorful`

---

## 📊 Data Structure

### Node Object

```typescript
interface Node {
  id: string
  type:
    | 'trigger'
    | 'action'
    | 'decision'
    | 'prompt'
    | 'condition'
    | 'delay'
    | 'webhook'
    | 'email'
    | 'sms'
    | 'database'
    | 'api'
  label: string
  ports: Port[]
  status?: 'success' | 'error' | 'warning' | 'pending'
  theme?: 'default' | 'dark' | 'minimal' | 'colorful'
}
```

### Port Object

```typescript
interface Port {
  id: string
  label?: string
  direction: 'in' | 'out'
}
```

### Edge Object

```typescript
interface Edge {
  id?: string
  from: { nodeId: string; portId: string }
  to: { nodeId: string; portId: string }
  type?: 'default' | 'success' | 'error' | 'warning'
}
```

---

## ⚙️ Configuration

### Layout Options

```vue
<template>
  <FlowChart :data="chartData" :layout-options="layoutOptions" />
</template>

<script setup>
const layoutOptions = {
  nodeHeight: 120, // Height of each node
  nodeSpacing: 100, // Vertical spacing between nodes
  horizontalSpacing: 300, // Horizontal spacing for branching
  startY: 50, // Starting Y position
  centerX: 400, // Center X position
}
</script>
```

### FlowChart Props

| Prop            | Type   | Default                    | Description          |
| --------------- | ------ | -------------------------- | -------------------- |
| `data`          | Object | `{ nodes: [], edges: [] }` | Chart data           |
| `layoutOptions` | Object | `{}`                       | Layout configuration |
| `theme`         | String | `'default'`                | Global theme         |

### FlowChart Events

| Event          | Payload                                          | Description      |
| -------------- | ------------------------------------------------ | ---------------- |
| `node-click`   | `{ id, type, label }`                            | Node clicked     |
| `edge-click`   | `{ fromNodeId, fromPortId, toNodeId, toPortId }` | Edge clicked     |
| `port-connect` | `{ portId, direction }`                          | Port interaction |

---

## 🎨 Advanced Customization

### Custom Node Component

```vue
<template>
  <Node
    :id="node.id"
    :type="node.type"
    :label="node.label"
    :ports="node.ports"
    :status="node.status"
    :theme="node.theme"
    @click="handleClick"
  >
    <!-- Custom icon -->
    <template #icon>
      <div class="custom-icon">🎨</div>
    </template>

    <!-- Custom content -->
    <div class="custom-content">
      <h4>{{ node.label }}</h4>
      <p>Custom description</p>
    </div>
  </Node>
</template>
```

### Custom Styling

```vue
<style scoped>
/* Override node styles */
:deep(.node) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

:deep(.node-trigger) {
  border-color: #48bb78;
}

:deep(.node-action) {
  border-color: #667eea;
}

:deep(.node-decision) {
  border-color: #ed8936;
}
</style>
```

---

## 🔧 API Reference

### FlowChart Component

```vue
import { FlowChart } from 'vue-flowchart-engine'
```

**Props:**

- `data: Object` - Chart data with nodes and edges
- `layoutOptions: Object` - Layout configuration
- `theme: String` - Global theme

**Events:**

- `node-click` - Fired when a node is clicked
- `edge-click` - Fired when an edge is clicked
- `port-connect` - Fired when a port is interacted with

### Node Component

```vue
import { Node } from 'vue-flowchart-engine'
```

**Props:**

- `id: String` - Unique node identifier
- `type: String` - Node type
- `label: String` - Node label
- `ports: Array` - Array of ports
- `status: String` - Node status
- `theme: String` - Node theme

**Slots:**

- `icon` - Custom icon
- `default` - Custom content

### Layout Utilities

```javascript
import {
  layoutFlowchart,
  calculateVerticalLayout,
  calculatePortPositions,
  calculateEdgePositions,
  getFlowchartHeight,
} from 'vue-flowchart-engine'
```

---

## 📱 Responsive Design

The flowchart engine is fully responsive and works on all screen sizes:

```vue
<template>
  <div class="flowchart-container">
    <FlowChart :data="chartData" :layout-options="responsiveLayout" />
  </div>
</template>

<script setup>
const responsiveLayout = {
  nodeHeight: window.innerWidth < 768 ? 100 : 120,
  nodeSpacing: window.innerWidth < 768 ? 60 : 100,
  horizontalSpacing: window.innerWidth < 768 ? 200 : 300,
  centerX: window.innerWidth < 768 ? 200 : 400,
}
</script>
```

---

## 🎯 Examples

### Simple Workflow

```vue
<template>
  <FlowChart :data="simpleWorkflow" />
</template>

<script setup>
const simpleWorkflow = {
  nodes: [
    {
      id: '1',
      type: 'trigger',
      label: 'Start',
      ports: [{ id: 'out1', label: 'Next', direction: 'out' }],
    },
    {
      id: '2',
      type: 'action',
      label: 'Process Data',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'out1', label: 'Success', direction: 'out' },
        { id: 'out2', label: 'Error', direction: 'out' },
      ],
    },
    {
      id: '3',
      type: 'action',
      label: 'Send Notification',
      ports: [{ id: 'in1', label: 'Input', direction: 'in' }],
    },
  ],
  edges: [
    {
      from: { nodeId: '1', portId: 'out1' },
      to: { nodeId: '2', portId: 'in1' },
    },
    {
      from: { nodeId: '2', portId: 'out1' },
      to: { nodeId: '3', portId: 'in1' },
    },
  ],
}
</script>
```

### Complex Decision Tree

```vue
<template>
  <FlowChart :data="decisionTree" />
</template>

<script setup>
const decisionTree = {
  nodes: [
    {
      id: '1',
      type: 'trigger',
      label: 'User Action',
      ports: [{ id: 'out1', label: 'Next', direction: 'out' }],
    },
    {
      id: '2',
      type: 'decision',
      label: 'User Type?',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'new', label: 'New User', direction: 'out' },
        { id: 'existing', label: 'Existing User', direction: 'out' },
        { id: 'vip', label: 'VIP User', direction: 'out' },
      ],
    },
    {
      id: '3',
      type: 'action',
      label: 'Welcome Email',
      ports: [{ id: 'in1', label: 'Input', direction: 'in' }],
    },
    {
      id: '4',
      type: 'action',
      label: 'Update Profile',
      ports: [{ id: 'in1', label: 'Input', direction: 'in' }],
    },
    {
      id: '5',
      type: 'action',
      label: 'VIP Treatment',
      ports: [{ id: 'in1', label: 'Input', direction: 'in' }],
    },
  ],
  edges: [
    {
      from: { nodeId: '1', portId: 'out1' },
      to: { nodeId: '2', portId: 'in1' },
    },
    {
      from: { nodeId: '2', portId: 'new' },
      to: { nodeId: '3', portId: 'in1' },
    },
    {
      from: { nodeId: '2', portId: 'existing' },
      to: { nodeId: '4', portId: 'in1' },
    },
    {
      from: { nodeId: '2', portId: 'vip' },
      to: { nodeId: '5', portId: 'in1' },
    },
  ],
}
</script>
```

---

## 🛠️ Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/vue-flowchart-engine.git
cd vue-flowchart-engine

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build library
npm run build:lib
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

- 📧 Email: support@vueflowchart.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/vue-flowchart-engine/issues)
- 📖 Documentation: [Full Documentation](https://vueflowchart.com/docs)
- 💬 Discord: [Join our community](https://discord.gg/vueflowchart)

---

Made with ❤️ by the Vue Flowchart Engine team

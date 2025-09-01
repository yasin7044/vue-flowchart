# Vue Flowchart Engine - API Documentation

## Table of Contents

- [Components](#components)
- [Data Structures](#data-structures)
- [Layout Utilities](#layout-utilities)
- [Events](#events)
- [Themes](#themes)
- [Examples](#examples)

---

## Components

### FlowChart

The main component that renders the entire flowchart.

#### Props

| Prop            | Type     | Default                    | Description                           |
| --------------- | -------- | -------------------------- | ------------------------------------- |
| `data`          | `Object` | `{ nodes: [], edges: [] }` | Chart data containing nodes and edges |
| `layoutOptions` | `Object` | `{}`                       | Layout configuration options          |
| `theme`         | `String` | `'default'`                | Global theme for all nodes            |

#### Events

| Event          | Payload                                          | Description                          |
| -------------- | ------------------------------------------------ | ------------------------------------ |
| `node-click`   | `{ id, type, label }`                            | Fired when a node is clicked         |
| `edge-click`   | `{ fromNodeId, fromPortId, toNodeId, toPortId }` | Fired when an edge is clicked        |
| `port-connect` | `{ portId, direction }`                          | Fired when a port is interacted with |

#### Example

```vue
<template>
  <FlowChart
    :data="chartData"
    :layout-options="layoutOptions"
    @node-click="handleNodeClick"
    @edge-click="handleEdgeClick"
  />
</template>

<script setup>
import { FlowChart } from 'vue-flowchart-engine'

const chartData = {
  nodes: [...],
  edges: [...]
}

const layoutOptions = {
  nodeHeight: 120,
  nodeSpacing: 100,
  horizontalSpacing: 300,
  startY: 50,
  centerX: 400
}

const handleNodeClick = (nodeData) => {
  console.log('Node clicked:', nodeData)
}

const handleEdgeClick = (edgeData) => {
  console.log('Edge clicked:', edgeData)
}
</script>
```

### Node

Individual node component with customizable content.

#### Props

| Prop     | Type     | Default     | Description                                    |
| -------- | -------- | ----------- | ---------------------------------------------- |
| `id`     | `String` | -           | Unique node identifier                         |
| `type`   | `String` | -           | Node type (trigger, action, decision, etc.)    |
| `label`  | `String` | -           | Node display label                             |
| `ports`  | `Array`  | `[]`        | Array of port objects                          |
| `status` | `String` | `''`        | Node status (success, error, warning, pending) |
| `theme`  | `String` | `'default'` | Node theme                                     |

#### Slots

| Slot      | Props      | Description                 |
| --------- | ---------- | --------------------------- |
| `icon`    | -          | Custom icon for the node    |
| `default` | `{ node }` | Custom content for the node |

#### Example

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
    <template #icon>
      <div class="custom-icon">🎨</div>
    </template>

    <div class="custom-content">
      <h4>{{ node.label }}</h4>
      <p>Custom description</p>
    </div>
  </Node>
</template>
```

### Port

Port component for input/output connections.

#### Props

| Prop        | Type     | Default | Description                    |
| ----------- | -------- | ------- | ------------------------------ |
| `id`        | `String` | -       | Unique port identifier         |
| `direction` | `String` | -       | Port direction ('in' or 'out') |
| `label`     | `String` | `''`    | Port display label             |

#### Events

| Event     | Payload                    | Description                  |
| --------- | -------------------------- | ---------------------------- |
| `click`   | `{ id, direction, label }` | Fired when port is clicked   |
| `connect` | `{ id, direction, label }` | Fired when port is connected |

#### Example

```vue
<template>
  <Port
    :id="port.id"
    :direction="port.direction"
    :label="port.label"
    @click="handlePortClick"
  />
</template>
```

### Edge

Edge component for connecting nodes.

#### Props

| Prop           | Type     | Default          | Description                                  |
| -------------- | -------- | ---------------- | -------------------------------------------- |
| `fromNodeId`   | `String` | -                | Source node ID                               |
| `fromPortId`   | `String` | -                | Source port ID                               |
| `toNodeId`     | `String` | -                | Target node ID                               |
| `toPortId`     | `String` | -                | Target port ID                               |
| `fromPosition` | `Object` | `{ x: 0, y: 0 }` | Source position                              |
| `toPosition`   | `Object` | `{ x: 0, y: 0 }` | Target position                              |
| `type`         | `String` | `'default'`      | Edge type (default, success, error, warning) |

#### Events

| Event   | Payload                                          | Description                |
| ------- | ------------------------------------------------ | -------------------------- |
| `click` | `{ fromNodeId, fromPortId, toNodeId, toPortId }` | Fired when edge is clicked |

---

## Data Structures

### Node Object

```typescript
interface Node {
  id: string
  type: NodeType
  label: string
  ports: Port[]
  status?: NodeStatus
  theme?: Theme
}

type NodeType =
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

type NodeStatus = 'success' | 'error' | 'warning' | 'pending'

type Theme = 'default' | 'dark' | 'minimal' | 'colorful'
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

### Layout Options

```typescript
interface LayoutOptions {
  nodeHeight?: number // Default: 120
  nodeSpacing?: number // Default: 100
  horizontalSpacing?: number // Default: 300
  startY?: number // Default: 50
  centerX?: number // Default: 400
}
```

---

## Layout Utilities

### layoutFlowchart

Main layout function that processes the entire flowchart.

```typescript
function layoutFlowchart(
  chartData: { nodes: Node[]; edges: Edge[] },
  options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] }
```

#### Parameters

- `chartData`: Chart data object containing nodes and edges
- `options`: Optional layout configuration

#### Returns

Processed chart data with calculated positions for nodes and edges.

#### Example

```javascript
import { layoutFlowchart } from 'vue-flowchart-engine'

const chartData = {
  nodes: [...],
  edges: [...]
}

const options = {
  nodeHeight: 120,
  nodeSpacing: 100,
  horizontalSpacing: 300
}

const processedData = layoutFlowchart(chartData, options)
```

### calculateVerticalLayout

Calculates vertical positions for nodes with branching support.

```typescript
function calculateVerticalLayout(
  nodes: Node[],
  edges: Edge[],
  options?: LayoutOptions
): Node[]
```

### calculatePortPositions

Calculates positions for ports within a node.

```typescript
function calculatePortPositions(node: Node, ports: Port[]): Port[]
```

### calculateEdgePositions

Calculates positions for edges between connected ports.

```typescript
function calculateEdgePositions(edges: Edge[], nodes: Node[]): Edge[]
```

### getFlowchartHeight

Calculates the total height needed for the flowchart.

```typescript
function getFlowchartHeight(nodes: Node[], options?: LayoutOptions): number
```

---

## Events

### Node Events

```javascript
// Node click event
const handleNodeClick = (nodeData) => {
  console.log('Node clicked:', {
    id: nodeData.id,
    type: nodeData.type,
    label: nodeData.label,
  })
}
```

### Edge Events

```javascript
// Edge click event
const handleEdgeClick = (edgeData) => {
  console.log('Edge clicked:', {
    fromNodeId: edgeData.fromNodeId,
    fromPortId: edgeData.fromPortId,
    toNodeId: edgeData.toNodeId,
    toPortId: edgeData.toPortId,
  })
}
```

### Port Events

```javascript
// Port click event
const handlePortClick = (portData) => {
  console.log('Port clicked:', {
    id: portData.id,
    direction: portData.direction,
    label: portData.label,
  })
}
```

---

## Themes

### Available Themes

| Theme      | Description              | Use Case                  |
| ---------- | ------------------------ | ------------------------- |
| `default`  | Clean, modern design     | General purpose           |
| `dark`     | Dark mode theme          | Low-light environments    |
| `minimal`  | Simple, clean design     | Professional applications |
| `colorful` | Vibrant, colorful design | Creative applications     |

### Applying Themes

#### Global Theme

```vue
<template>
  <FlowChart :data="chartData" theme="dark" />
</template>
```

#### Node-Specific Theme

```vue
<template>
  <Node
    :id="node.id"
    :type="node.type"
    :label="node.label"
    :ports="node.ports"
    theme="colorful"
  />
</template>
```

#### Custom Theme

```vue
<style scoped>
:deep(.node) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

:deep(.node-trigger) {
  border-color: #48bb78;
}

:deep(.node-action) {
  border-color: #667eea;
}
</style>
```

---

## Examples

### Basic Workflow

```vue
<template>
  <FlowChart :data="workflow" @node-click="handleNodeClick" />
</template>

<script setup>
import { ref } from 'vue'
import { FlowChart } from 'vue-flowchart-engine'

const workflow = ref({
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
      label: 'Process',
      ports: [
        { id: 'in1', label: 'Input', direction: 'in' },
        { id: 'out1', label: 'Success', direction: 'out' },
      ],
    },
    {
      id: '3',
      type: 'action',
      label: 'Complete',
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
})

const handleNodeClick = (nodeData) => {
  console.log('Node clicked:', nodeData)
}
</script>
```

### Decision Tree

```vue
<template>
  <FlowChart :data="decisionTree" />
</template>

<script setup>
import { ref } from 'vue'
import { FlowChart } from 'vue-flowchart-engine'

const decisionTree = ref({
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
  ],
})
</script>
```

### Custom Node Content

```vue
<template>
  <FlowChart :data="chartData">
    <template #node-trigger="{ node }">
      <div class="custom-trigger">
        <div class="trigger-icon">🎯</div>
        <h4>{{ node.label }}</h4>
        <p>Custom trigger content</p>
        <button @click="executeTrigger(node.id)">Execute</button>
      </div>
    </template>

    <template #node-action="{ node }">
      <div class="custom-action">
        <div class="action-icon">⚡</div>
        <h4>{{ node.label }}</h4>
        <div class="action-controls">
          <button @click="startAction(node.id)">Start</button>
          <button @click="stopAction(node.id)">Stop</button>
        </div>
      </div>
    </template>
  </FlowChart>
</template>

<script setup>
const executeTrigger = (nodeId) => {
  console.log('Executing trigger:', nodeId)
}

const startAction = (nodeId) => {
  console.log('Starting action:', nodeId)
}

const stopAction = (nodeId) => {
  console.log('Stopping action:', nodeId)
}
</script>

<style scoped>
.custom-trigger,
.custom-action {
  text-align: center;
  padding: 1rem;
}

.trigger-icon,
.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.action-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #5a67d8;
}
</style>
```

---

## Best Practices

### Performance

1. **Use reactive data**: Wrap chart data in `ref()` or `reactive()` for optimal performance
2. **Limit node count**: For large flowcharts, consider pagination or virtualization
3. **Optimize re-renders**: Use `v-memo` for static node content

### Accessibility

1. **Add ARIA labels**: Provide descriptive labels for screen readers
2. **Keyboard navigation**: Implement keyboard shortcuts for node selection
3. **Color contrast**: Ensure sufficient contrast ratios for all themes

### Customization

1. **Use slots**: Leverage Vue slots for custom node content
2. **CSS custom properties**: Use CSS variables for consistent theming
3. **Event handling**: Implement proper event handling for user interactions

### Data Structure

1. **Unique IDs**: Ensure all nodes and ports have unique identifiers
2. **Consistent types**: Use consistent node types throughout your application
3. **Validation**: Validate chart data before rendering

---

## Troubleshooting

### Common Issues

#### Nodes not rendering

- Check that all required props are provided
- Verify node data structure matches the expected format
- Ensure unique IDs for all nodes

#### Edges not connecting

- Verify port IDs match between nodes and edges
- Check that edge `from` and `to` properties are correct
- Ensure ports exist in the referenced nodes

#### Layout issues

- Adjust `layoutOptions` for better spacing
- Check node dimensions and port positions
- Verify branching logic for decision nodes

#### Performance problems

- Reduce the number of nodes if possible
- Use `v-memo` for static content
- Consider implementing virtualization for large charts

### Debug Tips

1. **Console logging**: Add console logs to track data flow
2. **Vue DevTools**: Use Vue DevTools to inspect component state
3. **CSS inspection**: Check computed styles for layout issues
4. **Event debugging**: Log all events to understand user interactions

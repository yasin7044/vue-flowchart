# Vue Flowchart Engine

> ⚡ A lightweight, extensible **flowchart engine in Vue 3** with auto-layout, dynamic ports, edges, and full slot-based customization.
> Build triggers, actions, decision nodes, and multi-port flows without drag & drop — fixed vertical alignment with smart spacing.

---

## ✨ Features

- 🎯 **Vue 3 + VueUse** powered
- 🔌 **Nodes with multiple ports** (in/out)
- 🔄 **Edges auto-connect** using `node:port` syntax
- 🧩 **Dynamic node types**: Trigger, Action, Decision (Prompt), or custom
- 🎨 **Slots for full customization** of nodes, ports, edges
- 📐 **Auto vertical alignment** (no drag & drop, fixed positioning)
- 📦 Designed to be **open-source & extensible**

---

## 🚀 Installation

```bash
npm install vue-flowchart-engine
# or
yarn add vue-flowchart-engine
```

---

## 🔧 Basic Usage

```vue
<script setup>
import { FlowChart } from 'vue-flowchart-engine'

const chartData = {
  nodes: [
    {
      id: '1',
      type: 'trigger',
      label: 'User Signup',
      ports: [{ id: 'out1', label: 'Next', direction: 'out' }],
    },
    {
      id: '2',
      type: 'action',
      label: 'Send Welcome Email',
      ports: [{ id: 'in1', label: 'Input', direction: 'in' }],
    },
  ],
  edges: [{ from: '1:out1', to: '2:in1' }],
}
</script>

<template>
  <FlowChart :data="chartData" />
</template>
```

---

## 🎨 Node Customization (Slots)

You can override node rendering using Vue slots.

```vue
<template>
  <FlowChart :data="chartData">
    <!-- Custom trigger node -->
    <template #node-trigger="{ node }">
      <div class="p-3 bg-green-200 rounded-xl shadow">
        <h3 class="font-bold text-green-900">{{ node.label }}</h3>
        <p class="text-xs">✨ This is a custom trigger</p>
      </div>
    </template>
  </FlowChart>
</template>
```

Slot naming convention:

- `#node-{type}` → Customize node by type
- Example: `#node-trigger`, `#node-action`, `#node-decision`, `#node-custom`

---

## 📊 JSON Data Structure

### Node

```json
{
  "id": "3",
  "type": "decision",
  "label": "Choose Path",
  "ports": [
    { "id": "p1", "label": "Email Route", "direction": "out" },
    { "id": "p2", "label": "SMS Route", "direction": "out" },
    { "id": "p3", "label": "Database Save", "direction": "out" }
  ]
}
```

### Edge

```json
{ "from": "3:p1", "to": "4:in1" }
```

---

## 🧩 Example Flow

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "trigger",
      "label": "User Signup",
      "ports": [{ "id": "out1", "label": "Next", "direction": "out" }]
    },
    {
      "id": "2",
      "type": "decision",
      "label": "Send Notification?",
      "ports": [
        { "id": "yes", "label": "Yes", "direction": "out" },
        { "id": "no", "label": "No", "direction": "out" }
      ]
    },
    {
      "id": "3",
      "type": "action",
      "label": "Send Email",
      "ports": [{ "id": "in1", "label": "Input", "direction": "in" }]
    },
    {
      "id": "4",
      "type": "action",
      "label": "Log to Database",
      "ports": [{ "id": "in2", "label": "Input", "direction": "in" }]
    }
  ],
  "edges": [
    { "from": "1:out1", "to": "2" },
    { "from": "2:yes", "to": "3:in1" },
    { "from": "2:no", "to": "4:in2" }
  ]
}
```

---

## ⚡ Roadmap

- [ ] Drag & drop node positioning
- [ ] Zoom & pan support
- [ ] Mini-map
- [ ] Export/import to JSON
- [ ] Edge labels & conditions
- [ ] Vue DevTools integration

---

## 🛠️ Development

Clone & run locally:

```bash
git clone https://github.com/your-username/vue-flowchart-engine
cd vue-flowchart-engine
npm install
npm run dev
```

---

## 🤝 Contributing

Pull requests are welcome!

- Fork the repo
- Create a feature branch
- Submit PR

---

## 📜 License

MIT © \[Your Name]

// Main export file for Vue Flowchart Engine

import FlowChart from './components/FlowChart.vue'
import Node from './components/Node.vue'
import Port from './components/Port.vue'
import Edge from './components/Edge.vue'
import {
  layoutFlowchart,
  calculateVerticalLayout,
  calculatePortPositions,
  calculateEdgePositions,
  getFlowchartHeight,
} from './components/utils/layout.js'

// Export components
export { FlowChart, Node, Port, Edge }

// Export layout utilities
export {
  layoutFlowchart,
  calculateVerticalLayout,
  calculatePortPositions,
  calculateEdgePositions,
  getFlowchartHeight,
}

// Default export
export default FlowChart

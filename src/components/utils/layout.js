/**
 * Layout utility for vertical flowchart arrangement with proper parent-child centering
 */

/**
 * Calculate centered layout positions for nodes with width-based centering
 * @param {Array} nodes - Array of node objects
 * @param {Array} edges - Array of edge objects
 * @param {Object} options - Layout options
 * @returns {Array} Nodes with calculated positions
 */
export function calculateVerticalLayout(nodes, edges, options = {}) {
  const {
    nodeHeight = 120,
    nodeSpacing = 100, // Reduced vertical spacing between levels
    startY = 80,
    centerX = 400,
    horizontalSpacing = 280, // Spacing between nodes on same level
  } = options

  const positionedNodes = []
  const processedNodes = new Set()
  const nodeLevels = new Map() // Track which level each node belongs to

  // Helper function to calculate node width based on ports
  const calculateNodeWidth = (node) => {
    if (!node.ports || node.ports.length === 0) return 200 // Default width

    const outputPorts = node.ports.filter((p) => p.direction === 'out')
    if (outputPorts.length <= 1) return 200 // Default width for single port

    // Calculate width based on number of output ports
    const minWidth = 200
    const portWidth = 120
    const padding = 40
    return Math.max(minWidth, outputPorts.length * portWidth + padding)
  }

  // Step 1: Find the root node (trigger node or node with no incoming edges)
  const rootNode = nodes.find(
    (node) =>
      node.type === 'trigger' ||
      !edges.some((edge) => edge.to.nodeId === node.id)
  )

  if (!rootNode) {
    console.warn('No root node found')
    return []
  }

  // Step 2: Position root node at top-center (only if no custom position)
  const rootWidth = calculateNodeWidth(rootNode)
  if (
    rootNode.position &&
    typeof rootNode.position.x === 'number' &&
    typeof rootNode.position.y === 'number'
  ) {
    // Use custom position if provided
    positionedNodes.push({
      ...rootNode,
      level: 0,
      width: rootWidth,
    })
  } else {
    // Calculate position
    positionedNodes.push({
      ...rootNode,
      position: { x: centerX - rootWidth / 2, y: startY }, // Position by left edge
      level: 0,
      width: rootWidth,
    })
  }
  processedNodes.add(rootNode.id)
  nodeLevels.set(rootNode.id, 0)

  // Step 3: Build parent-child relationships and position children with perfect centering
  let currentLevel = 0
  let levelNodes = [rootNode]

  while (levelNodes.length > 0) {
    const nextLevelNodes = []
    const levelParentChildMap = new Map() // Track children for each parent at this level

    // Find all nodes connected from current level
    for (const parentNode of levelNodes) {
      const outgoingEdges = edges.filter(
        (edge) => edge.from.nodeId === parentNode.id
      )
      const children = []

      for (const edge of outgoingEdges) {
        const targetNode = nodes.find((n) => n.id === edge.to.nodeId)
        if (targetNode && !processedNodes.has(targetNode.id)) {
          children.push(targetNode)
          processedNodes.add(targetNode.id)
          nodeLevels.set(targetNode.id, currentLevel + 1)
        }
      }

      if (children.length > 0) {
        levelParentChildMap.set(parentNode.id, children)
        nextLevelNodes.push(...children)
      }
    }

    // Position children with perfect center alignment to parent
    if (nextLevelNodes.length > 0) {
      currentLevel++
      const y = startY + currentLevel * (nodeHeight + nodeSpacing)

      // Group children by their parent and position them with perfect centering
      const positionedChildren = new Set()

      for (const parentNode of levelNodes) {
        const children = levelParentChildMap.get(parentNode.id)
        if (!children || children.length === 0) continue

        // Find the positioned parent node to get its position and width
        const positionedParent = positionedNodes.find(
          (n) => n.id === parentNode.id
        )
        if (!positionedParent || !positionedParent.position) {
          console.warn(
            `Parent node ${parentNode.id} not found or has no position`
          )
          continue
        }

        const parentCenterX =
          positionedParent.position.x + (positionedParent.width || 200) / 2
        const childCount = children.length

        // Calculate positions for children with perfect center alignment
        if (childCount === 1) {
          // Single child: position directly below parent center (only if no custom position)
          const child = children[0]
          const childWidth = calculateNodeWidth(child)

          if (
            child.position &&
            typeof child.position.x === 'number' &&
            typeof child.position.y === 'number'
          ) {
            // Use custom position if provided
            positionedNodes.push({
              ...child,
              level: currentLevel,
              width: childWidth,
            })
          } else {
            // Calculate position
            const childX = parentCenterX - childWidth / 2 // Center child on parent center
            positionedNodes.push({
              ...child,
              position: { x: childX, y },
              level: currentLevel,
              width: childWidth,
            })
          }
          positionedChildren.add(child.id)
        } else {
          // Multiple children: distribute horizontally with group center aligned to parent center
          const childWidths = children.map((child) => calculateNodeWidth(child))
          const totalChildWidth = childWidths.reduce(
            (sum, width) => sum + width,
            0
          )
          const totalSpacing = (childCount - 1) * horizontalSpacing
          const totalGroupWidth = totalChildWidth + totalSpacing

          // Calculate starting position so that group center aligns with parent center
          const groupStartX = parentCenterX - totalGroupWidth / 2
          let currentX = groupStartX

          children.forEach((child, index) => {
            if (!positionedChildren.has(child.id)) {
              const childWidth = childWidths[index]

              if (
                child.position &&
                typeof child.position.x === 'number' &&
                typeof child.position.y === 'number'
              ) {
                // Use custom position if provided
                positionedNodes.push({
                  ...child,
                  level: currentLevel,
                  width: childWidth,
                })
              } else {
                // Calculate position
                const childX = currentX
                positionedNodes.push({
                  ...child,
                  position: { x: childX, y },
                  level: currentLevel,
                  width: childWidth,
                })
                // Move to next child position only when calculating
                currentX += childWidth + horizontalSpacing
              }
              positionedChildren.add(child.id)
            }
          })
        }
      }

      levelNodes = nextLevelNodes
    } else {
      break
    }
  }

  // Step 4: Handle any remaining unconnected nodes
  nodes.forEach((node) => {
    if (!processedNodes.has(node.id)) {
      const nodeWidth = calculateNodeWidth(node)

      if (
        node.position &&
        typeof node.position.x === 'number' &&
        typeof node.position.y === 'number'
      ) {
        // Use custom position if provided
        positionedNodes.push({
          ...node,
          level: currentLevel + 1,
          width: nodeWidth,
        })
      } else {
        // Calculate position
        const y = startY + (currentLevel + 1) * (nodeHeight + nodeSpacing)
        positionedNodes.push({
          ...node,
          position: { x: centerX - nodeWidth / 2, y },
          level: currentLevel + 1,
          width: nodeWidth,
        })
      }
    }
  })

  return positionedNodes
}

/**
 * Calculate port positions within a node
 * @param {Object} node - Node object with position
 * @param {Array} ports - Array of port objects
 * @returns {Array} Ports with calculated positions
 */
export function calculatePortPositions(node, ports) {
  const nodeHeight = 120
  const portHeight = 32 // Height of port div (8px padding * 2 + text height)
  const portPadding = 8 // Horizontal padding of port div

  // Validate that node has a position
  if (
    !node ||
    !node.position ||
    typeof node.position.x === 'undefined' ||
    typeof node.position.y === 'undefined'
  ) {
    console.warn(`Node ${node?.id || 'unknown'} has no valid position`)
    return []
  }

  return ports.map((port, index) => {
    const isInput = port.direction === 'in'

    if (isInput) {
      // Input ports at top center of node
      const x = node.position.x + (node.width || 200) / 2
      const y = node.position.y - nodeHeight / 2 + 10 // Top of node

      return {
        ...port,
        position: { x, y },
      }
    } else {
      // Output ports positioned at the center of their div boxes
      const outputPorts = ports.filter((p) => p.direction === 'out')
      const portCount = outputPorts.length
      const nodeWidth = node.width || 200
      const portIndex = outputPorts.findIndex((p) => p.id === port.id)

      if (portCount === 1) {
        // Single output port at bottom center
        const x = node.position.x + nodeWidth / 2
        const y = node.position.y + nodeHeight / 2 + 16 + 16 // Bottom border + 16px offset + 16px to reach bottom of port block

        return {
          ...port,
          position: { x, y },
        }
      } else {
        // Multiple output ports - position at bottom of each port div
        // Calculate port positions to match the actual flexbox layout
        const portWidth = 60 // Approximate width of each port div (8px padding * 2 + text width)
        const portGap = 12 // Gap between ports (from CSS gap: 12px)
        const totalPortsWidth = portCount * portWidth
        const totalGaps = (portCount - 1) * portGap
        const totalWidth = totalPortsWidth + totalGaps

        // Center the ports within the node (matching flexbox justify-content: center)
        const nodeCenterX = node.position.x + nodeWidth / 2
        const portsStartX = nodeCenterX - totalWidth / 2

        // Calculate the center of each port div
        const portDivCenterX =
          portsStartX + portIndex * (portWidth + portGap) + portWidth / 2
        const y = node.position.y + nodeHeight / 2 + 16 + 16 // Bottom border + 16px offset + 16px to reach bottom of port block

        return {
          ...port,
          position: { x: portDivCenterX, y },
        }
      }
    }
  })
}

/**
 * Calculate edge positions between connected ports
 * @param {Array} edges - Array of edge objects
 * @param {Array} nodes - Array of nodes with positions
 * @returns {Array} Edges with calculated positions
 */
export function calculateEdgePositions(edges, nodes) {
  return edges.map((edge) => {
    const fromNode = nodes.find((n) => n.id === edge.from.nodeId)
    const toNode = nodes.find((n) => n.id === edge.to.nodeId)

    if (!fromNode || !toNode) {
      console.warn(
        `Edge references non-existent node: ${edge.from.nodeId} -> ${edge.to.nodeId}`
      )
      return edge
    }

    // Validate that nodes have positions
    if (!fromNode.position || !toNode.position) {
      console.warn(`Node missing position: ${fromNode.id} or ${toNode.id}`)
      return edge
    }

    // Handle trigger nodes (no ports) - connect from center-bottom
    if (fromNode.type === 'trigger') {
      const fromPosition = {
        x: fromNode.position.x + (fromNode.width || 200) / 2, // Center of node
        y: fromNode.position.y + 60, // Bottom center of trigger node
      }

      // Connect to center-top of target node
      const toPosition = {
        x: toNode.position.x + (toNode.width || 200) / 2, // Center of target node
        y: toNode.position.y - 60, // Top center of target node
      }

      return {
        ...edge,
        fromPosition,
        toPosition,
      }
    }

    // Handle regular nodes with ports - connect from actual port positions
    let fromPosition, toPosition

    // Find the source port position
    if (fromNode.ports && fromNode.ports.length > 0 && edge.from.portId) {
      const sourcePort = fromNode.ports.find((p) => p.id === edge.from.portId)
      if (sourcePort && sourcePort.position) {
        fromPosition = sourcePort.position
      } else {
        // Fallback to center-bottom if port position not found
        fromPosition = {
          x: fromNode.position.x + (fromNode.width || 200) / 2,
          y: fromNode.position.y + 60,
        }
      }
    } else {
      // Fallback to center-bottom if no ports or no portId specified
      fromPosition = {
        x: fromNode.position.x + (fromNode.width || 200) / 2,
        y: fromNode.position.y + 60,
      }
    }

    // Find the target port position
    if (toNode.ports && toNode.ports.length > 0) {
      const targetPort = toNode.ports.find((p) => p.id === edge.to.portId)
      if (targetPort && targetPort.position) {
        toPosition = targetPort.position
      } else {
        // Fallback to center-top if port position not found
        toPosition = {
          x: toNode.position.x + (toNode.width || 200) / 2,
          y: toNode.position.y - 60,
        }
      }
    } else {
      // Fallback to center-top if no ports
      toPosition = {
        x: toNode.position.x + (toNode.width || 200) / 2,
        y: toNode.position.y - 60,
      }
    }

    return {
      ...edge,
      fromPosition,
      toPosition,
    }
  })
}

/**
 * Main layout function that processes the entire flowchart
 * @param {Object} chartData - Chart data with nodes and edges
 * @param {Object} options - Layout options
 * @returns {Object} Processed chart data with positions
 */
export function layoutFlowchart(chartData, options = {}) {
  const { nodes = [], edges = [] } = chartData

  // Calculate node positions with proper parent-child centering
  const positionedNodes = calculateVerticalLayout(nodes, edges, options)

  // Calculate port positions for each node
  const nodesWithPorts = positionedNodes.map((node) => ({
    ...node,
    ports:
      node.type === 'trigger'
        ? []
        : calculatePortPositions(node, node.ports || []),
  }))

  // Calculate edge positions
  const positionedEdges = calculateEdgePositions(edges, nodesWithPorts)

  return {
    nodes: nodesWithPorts,
    edges: positionedEdges,
  }
}

/**
 * Get the total height needed for the flowchart
 * @param {Array} nodes - Array of positioned nodes
 * @param {Object} options - Layout options
 * @returns {number} Total height in pixels
 */
export function getFlowchartHeight(nodes, options = {}) {
  const { nodeHeight = 120, nodeSpacing = 120, startY = 80 } = options

  // Find the maximum level to calculate height
  const maxLevel = Math.max(...nodes.map((node) => node.level || 0), 0)
  return startY + (maxLevel + 1) * (nodeHeight + nodeSpacing) + 80
}

/**
 * Get the total width needed for the flowchart
 * @param {Array} nodes - Array of positioned nodes
 * @param {Object} options - Layout options
 * @returns {number} Total width in pixels
 */
export function getFlowchartWidth(nodes, options = {}) {
  const { horizontalSpacing = 280 } = options

  // Find the maximum number of nodes at any level
  const levelCounts = new Map()
  nodes.forEach((node) => {
    const level = node.level || 0
    levelCounts.set(level, (levelCounts.get(level) || 0) + 1)
  })

  const maxNodesAtLevel = Math.max(...levelCounts.values(), 1)
  const totalWidth = (maxNodesAtLevel - 1) * horizontalSpacing + 200 // 200px for node width

  return Math.max(totalWidth, 800) // Minimum 800px width
}

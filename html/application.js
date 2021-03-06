import * as d3 from 'd3'
import * as webcola from 'webcola'

import { textwrap } from 'd3-textwrap';
d3.textwrap = textwrap;

const Layout = {
  group: {
    margin: 50,
    padding: 10
  },
  node: {
    height: 90,
    margin: 10,
    padding: 20,
    width: 300
  }
}

const generateConstraints = function (groups) {
  const constraints = []
  let previousGroup
  groups.forEach((group) => {
    const constraint = {
      type: 'alignment',
      axis: 'x',
      offsets: []
    }

    group.leaves.forEach((leaf) => {
      constraint.offsets.push({
        node: leaf,
        offset: 0
      })
    })

    // Add an inequality constraint for all nodes in this group saying there
    // must be a gap on the x axis between all nodes in the previous group
    if (previousGroup) {
      const nodesInPreviousGroup = previousGroup.leaves
      const nodesInThisGroup = group.leaves

      constraints.push({
        axis: 'x',
        left: nodesInPreviousGroup[0],
        right: nodesInThisGroup[0],
        gap: Layout.node.width + Layout.group.margin
      })
    }
    previousGroup = group

    constraints.push(constraint)
  })

  return constraints
}

const handleZoom = function (event) {
  d3
    .select('svg g')
    .attr('transform', event.transform);
}

const zoomToFit = function () {
  const outer = layoutWithHierarchicalGroupingSvg
  const svg = outer.node()
  const boundingBox = svg.getBBox()

  const padding = 20

  const left = boundingBox.x - padding
  const top = boundingBox.y - padding
  const width = boundingBox.width + padding * 2
  const height = boundingBox.height + padding * 2

  svg.setAttribute('viewBox', left + ',' + top + ',' + width + ',' + height)
}

function layoutWithHierarchicalGrouping (graph, svg) {
  if (!svg) { return }

  const cola = webcola.d3adaptor(d3)
    .linkDistance(80)
    .avoidOverlaps(true)
    .size([3000, 4000])

  graph.nodes.forEach(function (v) {
    v.width = Layout.node.width
    v.height = Layout.node.height
  })

  const groups = graph.groups || []
  groups.forEach(function (g) {
    g.padding = Layout.group.padding
  })

  const constraints = generateConstraints(groups)

  const centerGraph = true
  const gridSnapIterations = 50
  const initialAllConstraintIterations = 10
  const initialUnconstrainedIterations = 40
  const initialUserConstraintIterations = 50
  const keepRunning = true

  cola
    .nodes(graph.nodes)
    .links(graph.links)
    .groups(groups)
    .constraints(constraints)
    .handleDisconnected(false)
    .start(
      initialUnconstrainedIterations,
      initialUserConstraintIterations,
      initialAllConstraintIterations,
      gridSnapIterations,
      keepRunning,
      centerGraph
    )

  // Wrap the entire graph in a single g element. This allows us to use the g
  // element for zooming and translating the graph
  const graphOutlet = svg.append("g")

  const group = graphOutlet.selectAll('.group')
    .data(groups)
    .enter().append('rect')
    .attr('rx', 18).attr('ry', 18)
    .attr('class', 'group')

  const groupLabel = graphOutlet.selectAll('.group-label')
    .data(graph.groups)
    .enter().append('text')
    .attr('class', 'group-label')
    .text(function (d) { return d.name })

  const link = graphOutlet.selectAll('.link')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'link')

  const node = graphOutlet.selectAll('.node')
    .data(graph.nodes)
    .enter().append('rect')
    .attr('class', 'node')
    .attr('width', function (d) { return d.width - Layout.node.margin * 2 })
    .attr('height', function (d) { return d.height - Layout.node.margin * 2 })
    .attr('rx', 5).attr('ry', 5)

  const nodeLabelWrapper = d3
    .textwrap()
    .bounds({
      height: Layout.node.height - Layout.node.padding * 2,
      width: Layout.node.width - Layout.node.padding * 2
    })
    .method("tspans")
  const nodeLabel = graphOutlet.selectAll('.label')
    .data(graph.nodes)
    .enter().append('text')
    .attr('class', 'label')
    .attr('dominant-baseline', 'hanging')
    .text(function (d) { return d.name })
    .call(nodeLabelWrapper)

  node.append('title')
    .text(function (d) { return d.name })

  // define arrow markers for child links
  svg.append('svg:defs').append('svg:marker')
    .attr('id', 'child-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 9)
    .attr('markerHeight', 9)
    .attr('orient', 'auto')
  .append('svg:path')
    // .attr('d', 'M0,-5L10,0L0,5')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

  cola.on('tick', function () {
    // Nodes link from the child to the parent
    link.attr('x1', function (d) { return d.source.x - d.source.width / 2 })
      .attr('y1', function (d) {
        return d.source.y
      })
      .attr('x2', function (d) { return d.target.x + d.target.width / 2 - Layout.node.margin })
      .attr('y2', function (d) {
        return d.target.y
      })

    // Anchor nodes so their center is on the x,y position
    node
      .attr('x', function (d) { return d.x - d.width / 2 + Layout.node.margin })
      .attr('y', function (d) { return d.y - d.height  / 2 + Layout.node.margin })

    // Text elements are anchored so that their top left corner is on the nodes
    // x,y position + padding
    nodeLabel
      .attr('x', function (node) { return node.x - node.width / 2 + Layout.node.margin + Layout.node.padding })
      .attr('y', function (node) { return node.y - node.height / 2 + Layout.node.margin + Layout.node.padding })

    group.attr('x', function (d) { return d.bounds.x })
      .attr('y', function (d) { return d.bounds.y })
      .attr('width', function (d) { return d.bounds.width() })
      .attr('height', function (d) { return d.bounds.height() })
    groupLabel
      .attr('x', function (d) {
        return d.bounds.x
      })
      .attr('y', function (d) {
        return d.bounds.y - Layout.group.padding
      })

    zoomToFit()

    // Setup zoom and panning
    const zoom = d3.zoom().on('zoom', handleZoom)
    svg.call(zoom)
  })
}

const target = document.querySelector('[data-role=graph]')
const width = target.clientWidth
const height = target.clientHeight

const layoutWithHierarchicalGroupingSvg = d3
  .select('[data-role=graph]')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

d3.json('./elements.json').then((data) => {
  layoutWithHierarchicalGrouping(data, layoutWithHierarchicalGroupingSvg)
})

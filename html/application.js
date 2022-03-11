import * as d3 from 'd3'
import * as webcola from 'webcola'

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
  const groupPadding = 20
  const nodeMargin = 10

  const color = d3.scaleLinear().domain([1, 10]).range(['lightBlue', 'blue'])
  const cola = webcola.d3adaptor(d3)
    .linkDistance(80)
    .avoidOverlaps(true)
    .size([3000, 4000])

  graph.nodes.forEach(function (v) {
    v.width = 300
    v.height = 95
  })

  const groups = graph.groups || []
  groups.forEach(function (g) {
    g.padding = groupPadding
  })

  const constraints = []
  let previousGroup
  groups.forEach((group) => {
    const constraint = {
      type: 'alignment',
      axis: 'y',
      offsets: []
    }

    group.leaves.forEach((leaf) => {
      constraint.offsets.push({
        node: leaf,
        offset: 0
      })
    })

    // Add an inequality constraint for all nodes in this group saying there
    // must be a 150 pixels gap on the y axis between all nodes in the previous group
    if (previousGroup) {
      const nodesInPreviousGroup = previousGroup.leaves
      const nodesInThisGroup = group.leaves

      nodesInThisGroup.forEach((thisNode) => {
        nodesInPreviousGroup.forEach((otherNode) => {
          constraints.push({
            axis: 'y',
            left: otherNode,
            right: thisNode,
            gap: 150
          })
        })
      })
    }
    previousGroup = group

    constraints.push(constraint)
  })

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
    .start(
      initialUnconstrainedIterations,
      initialUserConstraintIterations,
      initialAllConstraintIterations,
      gridSnapIterations,
      keepRunning,
      centerGraph
    )

  const group = svg.selectAll('.group')
    .data(groups)
    .enter().append('rect')
    .attr('rx', 8).attr('ry', 8)
    .attr('class', 'group')
    .style('fill', function (d, i) { return color(i) })

  const groupLabel = svg.selectAll('.group-label')
    .data(graph.groups)
    .enter().append('text')
    .attr('class', 'group-label')
    .style('fill', 'black')
    .text(function (d) { return d.name })

  const link = svg.selectAll('.link')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'link')

  const node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append('rect')
    .attr('class', 'node')
    .attr('width', function (d) { return d.width - nodeMargin * 2 })
    .attr('height', function (d) { return d.height - nodeMargin * 2 })
    .attr('rx', 5).attr('ry', 5)
    .style('fill', function (d) { return color(groups.length) })

  const label = svg.selectAll('.label')
    .data(graph.nodes)
    .enter().append('text')
    .attr('class', 'label')
    .style('text-anchor', 'middle')
    .attr('dy', '0.2em')
    .text(function (d) { return d.name })

  node.append('title')
    .text(function (d) { return d.name })

  cola.on('tick', function () {
    link.attr('x1', function (d) { return d.source.x })
      .attr('y1', function (d) { return d.source.y })
      .attr('x2', function (d) { return d.target.x })
      .attr('y2', function (d) { return d.target.y })

    // Anchor nodes so their center is on the x,y position
    node
      .attr('x', function (d) { return d.x - d.width / 2 + nodeMargin })
      .attr('y', function (d) { return d.y - d.height  / 2 + nodeMargin })

    // Text elements are anchored so that their center is on the nodes x,y
    // position
    label
      .attr('x', function (node) { return node.x })
      .attr('y', function (node) { return node.y })

    group.attr('x', function (d) { return d.bounds.x })
      .attr('y', function (d) { return d.bounds.y })
      .attr('width', function (d) { return d.bounds.width() })
      .attr('height', function (d) { return d.bounds.height() })
    groupLabel
      .attr('x', function (d) {
        return d.bounds.x
      })
      .attr('y', function (d) {
        return d.bounds.y
      })

    zoomToFit()
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

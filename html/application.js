import * as d3 from 'd3'
import * as webcola from 'webcola'

function layoutWithHierarchicalGrouping (graph, svg) {
  const color = d3.scaleLinear().domain([1, 10]).range(['lightBlue', 'blue'])
  const cola = webcola.d3adaptor(d3)
    .linkDistance(80)
    .avoidOverlaps(true)
    .size([width, height])

  graph.nodes.forEach(function (v) {
    v.width = 300
    v.height = 95
  })

  const groups = graph.groups || []
  groups.forEach(function (g) { g.padding = 0.01 })

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
    .style('font-size', '24px')
    .text(function (d) { return d.name })

  const link = svg.selectAll('.link')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'link')

  const pad = 20
  const node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append('rect')
    .attr('class', 'node')
    .attr('width', function (d) { return d.width - 2 * pad })
    .attr('height', function (d) { return d.height - 2 * pad })
    .attr('rx', 5).attr('ry', 5)
    .style('fill', function (d) { return color(groups.length) })
    .call(cola.drag)
    .on('mouseup', function (d) {
      d.fixed = 0
      cola.alpha(1) // fire it off again to satify gridify
    })

  const label = svg.selectAll('.label')
    .data(graph.nodes)
    .enter().append('text')
    .attr('class', 'label')
    .style('fill', 'black')
    .style('font-size', '14px')
    .text(function (d) { return d.name })
    .call(cola.drag)

  node.append('title')
    .text(function (d) { return d.name })

  cola.on('tick', function () {
    link.attr('x1', function (d) { return d.source.x })
      .attr('y1', function (d) { return d.source.y })
      .attr('x2', function (d) { return d.target.x })
      .attr('y2', function (d) { return d.target.y })

    node.attr('x', function (d) { return d.x - d.width / 2 + pad })
      .attr('y', function (d) { return d.y - d.height / 2 + pad })

    group.attr('x', function (d) { return d.bounds.x })
      .attr('y', function (d) { return d.bounds.y })
      .attr('width', function (d) { return d.bounds.width() })
      .attr('height', function (d) { return d.bounds.height() })

    label.attr('x', function (d) { return d.x })
      .attr('y', function (d) {
        const h = this.getBBox().height
        return d.y + h / 4
      })

    groupLabel
      .attr('x', function (d) { return d.bounds.x - 15 })
      .attr('y', function (d) {
        return d.bounds.y + 55
      })
  })
}

const width = 960
const height = 1500

const layoutWithHierarchicalGroupingSvg = d3
  .select('[data-role=graph]')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .call(d3.zoom().on("zoom", function (e) {
    layoutWithHierarchicalGroupingSvg.attr("transform", e.transform)
  }))

d3.json('./elements.json').then((data) => {
  layoutWithHierarchicalGrouping(data, layoutWithHierarchicalGroupingSvg)
})

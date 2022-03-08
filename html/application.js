import * as d3 from 'd3'
import * as webcola from 'webcola'

function layoutWithHierarchicalGrouping (graph, svg) {
  const color = d3.scaleLinear().domain([1, 10]).range(['lightBlue', 'blue'])
  const cola = webcola.d3adaptor(d3)
    .linkDistance(80)
    .avoidOverlaps(true)
    .handleDisconnected(false)
    .size([width, height])

  graph.nodes.forEach(function (v) {
    v.width = 300
    v.height = 95
  })

  const groups = graph.groups || []
  groups.forEach(function (g) { g.padding = 0.01 })
  cola
    .nodes(graph.nodes)
    .links(graph.links)
    .groups(groups)
    .start(100, 0, 50, 50)

  const group = svg.selectAll('.group')
    .data(groups)
    .enter().append('rect')
    .attr('rx', 8).attr('ry', 8)
    .attr('class', 'group')
    .style('fill', function (d, i) { return color(i) })

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
  })
}

function simpleGroupsExample (graph, svg) {
  const color = d3.scaleLinear().domain([1, 10]).range(['green', 'blue'])

  var cola = webcola.d3adaptor(d3)
    .size([width, height])

  const groupMap = {}
  graph.nodes.forEach(function (v, i) {
    const g = v.group
    if (typeof groupMap[g] === 'undefined') {
      groupMap[g] = []
    }
    groupMap[g].push(i)

    v.width = v.height = 10
  })

  const groups = []
  for (const g in groupMap) {
    groups.push({ id: g, leaves: groupMap[g] })
  }
  cola
    .nodes(graph.nodes)
    .links(graph.links)
    .groups(groups)
    .jaccardLinkLengths(40, 0.7)
    .avoidOverlaps(true)
    .start(50, 0, 50)

  const group = svg.selectAll('.group')
    .data(groups)
    .enter().append('rect')
    .classed('group', true)
    .attr('rx', 5)
    .attr('ry', 5)
    .style('fill', function (d) { return color(d.id) })
    .call(cola.drag)

  const link = svg.selectAll('.link')
    .data(graph.links)
    .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function (d) { return Math.sqrt(d.value) })

  const node = svg.selectAll('.node')
    .data(graph.nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr('r', 5)
    .style('fill', function (d) { return color(d.group) })
    .call(cola.drag)

  node.append('title')
    .text(function (d) { return d.name })

  cola.on('tick', function () {
    link.attr('x1', function (d) { return d.source.x })
      .attr('y1', function (d) { return d.source.y })
      .attr('x2', function (d) { return d.target.x })
      .attr('y2', function (d) { return d.target.y })

    node.attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })

    group
      .attr('x', function (d) { return d.bounds.x })
      .attr('y', function (d) { return d.bounds.y })
      .attr('width', function (d) { return d.bounds.width() })
      .attr('height', function (d) { return d.bounds.height() })
  })
}

var width = 960; var height = 1500

const layoutWithHierarchicalGroupingSvg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

const simpleGroupsExampleSvg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)


  // Load data and generate graph
d3.json('./elements.json').then((data) => {
  // layoutWithHierarchicalGrouping(data, layoutWithHierarchicalGroupingSvg)
  simpleGroupsExample(data, simpleGroupsExampleSvg)
})

import cytoscape from "cytoscape/dist/cytoscape.esm";
import dagre from 'cytoscape-dagre';
cytoscape.use(dagre)

const elements = [
  { // group 01
    data: { id: "01", classes: ["group"] }
  },
  { // group 02
    data: { id: "02", classes: ["group"] }
  },
  { // group 03
    data: { id: "03", classes: ["group"] }
  },
  { // group 04
    data: { id: "04", classes: ["group"] }
  },
  { // node a
    data: { id: "a", parent: "01" }
  },
  { // node b
    data: { id: "b", parent: "02" }
  },
  { // node c
    data: { id: "c", parent: "03" }
  },
  { // node d
    data: { id: "d", parent: "04" }
  },
  { // node e
    data: { id: "e", parent: "04" }
  },
  { // edge ab
    data: { id: "ab", source: "a", target: "b" }
  },
  { // edge ac
    data: { id: "ac", source: "a", target: "c" }
  },
  { // edge bd
    data: { id: "bd", source: "b", target: "d" }
  },
  { // edge ae
    data: { id: "ae", source: "a", target: "e" }
  }


]
const layout = {
  name: "dagre"
}

// the stylesheet for the graph
const style = [
  {
    selector: "node",
    style: {
      "label": "data(id)"
    }
  },

  {
    selector: 'node:parent',
    css: {
      'background-opacity': 0.333
    }
  },

  {
    selector: "node.group",
    style: {
      "label": "data(id)"
    }
  },

  {
    selector: "edge",
    style: {
      "curve-style": "bezier",
      "line-color": "#ccc",
      "target-arrow-color": "#ccc",
      "target-arrow-shape": "triangle",
      "width": 2
    }
  }
]

var graph = cytoscape({
  container: document.getElementById("graph"),
  elements: elements,
  layout: layout,
  style: style,
});

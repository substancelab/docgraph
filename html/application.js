import cytoscape from "cytoscape/dist/cytoscape.esm";

const elements = [
  { // node a
    data: { id: "a" }
  },
  { // node b
    data: { id: "b" }
  },
  { // edge ab
    data: { id: "ab", source: "a", target: "b" }
  }
]
const layout = {
  name: "grid",
  rows: 1
}
const style = [ // the stylesheet for the graph
  {
    selector: "node",
    style: {
      "background-color": "#666",
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
      "width": 3
    }
  }
]

var graph = cytoscape({
  container: document.getElementById("graph"),
  elements: elements,
  layout: layout,
  style: style,
});

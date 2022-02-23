import cytoscape from "cytoscape/dist/cytoscape.esm";
import fcose from 'cytoscape-fcose';

const elements = [
  { // node group 01
    data: { id: "01", classes: ["group"] }
  },
  { // node group 02
    data: { id: "02" }
  },
  { // node a
    data: { id: "a", parent: "01" }
  },
  { // node b
    data: { id: "b", parent: "02" }
  },
  { // node c
    data: { id: "c", parent: "02" }
  },
  { // edge ab
    data: { id: "ab", source: "a", target: "b" }
  },
  { // edge ac
    data: { id: "ac", source: "a", target: "c" }
  }

]
const layout = {
  animate: false,
  relativePlacementConstraint: [
    {top: 'a', bottom: 'b', gap: 200},
    {left: 'b', right: 'c', gap: 150},
  ],
  name: "fcose",

}
const style = [ // the stylesheet for the graph
  {
    selector: "node",
    style: {
      "label": "data(id)"
    }
  },

  {
    selector: "node.group",
    style: {
      "border-radius": "10px",
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

cytoscape.use(fcose)

var graph = cytoscape({
  container: document.getElementById("graph"),
  elements: elements,
  layout: layout,
  style: style,
});

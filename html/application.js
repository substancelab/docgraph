import cytoscape from "cytoscape/dist/cytoscape.esm";
import dagre from 'cytoscape-dagre';
cytoscape.use(dagre)

import elements from "./elements"

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

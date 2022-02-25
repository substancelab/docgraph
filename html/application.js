import cytoscape from "cytoscape/dist/cytoscape.esm";
import dagre from 'cytoscape-dagre';
cytoscape.use(dagre)

import elements from "./elements"

const layout = {
  name: "dagre",

  // Labels should be included in determining the space used by a node
  nodeDimensionsIncludeLabels: true,

  nodeSep: 100,

  // Flow ranks from top to bottom
  rankDir: "TB",

  rankSep: 100,
}

// the stylesheet for the graph
const style = [
  {
    selector: "node",
    style: {
      "label": "data(title)"
    }
  },

  {
    selector: 'node:parent',
    css: {
      'background-opacity': 0.333,
      "label": "data(id)",
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
  autoungrabify: true,
  autounselectify: true,
  container: document.getElementById("graph"),
  elements: elements,
  layout: layout,
  style: style,
  userPanningEnabled: false,
  userZoomingEnabled: false
});

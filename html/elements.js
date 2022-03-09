const elements = [
  { // group 01
    data: { id: '01', classes: ['group'] }
  },
  { // group 02
    data: { id: '02', classes: ['group'] }
  },
  { // group 03
    data: { id: '03', classes: ['group'] }
  },
  { // group 04
    data: { id: '04', classes: ['group'] }
  },
  { // node a
    data: { id: 'a', parent: '01' }
  },
  { // node b
    data: { id: 'b', parent: '02' }
  },
  { // node c
    data: { id: 'c', parent: '03' }
  },
  { // node d
    data: { id: 'd', parent: '04' }
  },
  { // node e
    data: { id: 'e', parent: '04' }
  },
  { // edge ab
    data: { id: 'ab', source: 'a', target: 'b' }
  },
  { // edge ac
    data: { id: 'ac', source: 'a', target: 'c' }
  },
  { // edge bd
    data: { id: 'bd', source: 'b', target: 'd' }
  },
  { // edge ae
    data: { id: 'ae', source: 'a', target: 'e' }
  }
]

export default elements

import React from 'react'
import ReactDOM from 'react-dom'
import Canvas from './canvas'

ReactDOM.render(<Canvas
  width={innerWidth}
  height={innerHeight}
  config={{
    width: 1024, 
    height: 512
  }}
/>, document.getElementById('root'))

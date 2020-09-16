import React from 'react'
import ReactDOM from 'react-dom'
import Canvas from './canvas'
import { Rule } from './rules'

class Main extends React.Component {
  state = {
    width: innerWidth,
    height: innerHeight,
    running: true,
    size: 8192
  }
  componentDidMount() {
    window.addEventListener('resize', e => {
      this.setState({ width: innerWidth, height: innerHeight })
    })
    window.addEventListener('keydown', e => {
      if (e.key == ' ') this.setState({ running: !this.state.running })
    })
  }
  render() {
    return <Canvas
      width={this.state.width}
      height={this.state.height}
      config={{
        width: this.state.size,
        height: this.state.size
      }}
      running={this.state.running}
      rules={[Rule.Die, Rule.Die, Rule.Keep, Rule.Spawn, Rule.Die, Rule.Die, Rule.Die, Rule.Keep, Rule.Die]}
    />
  }
}

ReactDOM.render(<Main />, document.getElementById('root'))
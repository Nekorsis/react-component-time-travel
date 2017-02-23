class Counter extends React.Component {
  constructor() {
    super()
    this.state = {
      count: 1,
    };
  }

  render() {
    const onClick = () => {
      this.setState(state => {
        return { count: state.count + 1 }
      })
    }

    return React.DOM.span({ style: { background: this.props.color, padding: 10 } },
      this.state.count,
      React.DOM.button({ onClick } , '+')
    )
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      color: 'green',
    };
  }

  render() {
    return React.DOM.div(null,
      React.DOM.input({ onChange: e => this.setState({ color: e.target.value }), value: this.state.color }),
      React.createElement(Counter, { key: 'counter-1', color: this.state.color }),
    )
  }
}

ReactDOM.render(React.createElement(App), document.getElementById('app'))

import { last } from './utils.js'

export function timeTravel(ComponentClass) {
  return class TimeTravel extends ComponentClass {
    constructor() {
      super()
      this.initHistory = ({ state, props }) => {
        this.setState({ history: [{ state, props }] })
      }

      this.revision = ({ props, statePatch }) => {
        this.setState(state => {
          const prevRecord = last(state.history)
          const newRecord = {
            props: props
              ? props
              : prevRecord.props,
            state: statePatch
              ? Object.assign({}, prevRecord.state, statePatch)
              : prevRecord.state
          }

          const revisionIndex = this.getIndexAsNumber(state.currentRevisionIndex) + 1
          return {
            currentRevisionIndex: revisionIndex,
            history: [...state.history.slice(0, revisionIndex), newRecord]
          }
        })
      }

      this.state = {
        currentRevisionIndex: 'last', // number | 'last'
      }
    }

    componentWillUpdate(nextProps, nextState) {
      console.log('nextState.history', nextState.history)
      if (this.props !== nextProps) {
        this.revision({ props: nextProps })
      }
      if (this.state.currentRevisionIndex !== nextState.currentRevisionIndex) {
        const statePatch = this.getCurrentRevision(nextState).state
        this.node.__originalSetState(statePatch)
      }
    }

    render() {
      const patchSetState = originalSetState => (overFunctionOrPatchObject, callback) => {
        const isFunction = overFunctionOrPatchObject instanceof Function
        if (isFunction) {
          const overFunction = overFunctionOrPatchObject
          const modifiedOverFunction = state => {
            const statePatch = overFunction(state)
            this.revision({ statePatch: statePatch })
            return statePatch
          }
          originalSetState(modifiedOverFunction, callback)
        } else {
          const patchObject = overFunctionOrPatchObject
          this.revision({ statePatch: patchObject })
          originalSetState(patchObject, callback)
        }
      }

      const ref = node => {
        if (!node || this.node) return
        this.initHistory({ props: this.props, state: node.state })
        node.__originalSetState = node.setState.bind(node)
        node.setState = patchSetState(node.__originalSetState)
        this.node = node
      }

      const normilizeRevisionIndex = index => {
        return this.isLastRevisionIndex(index) ? 'last' : index
      }

      const updateRevisionIndex = update => {
        this.setState(state => {
          return {
            currentRevisionIndex: update(this.getIndexAsNumber(state.currentRevisionIndex)),
          }
        })
      }

      const setRevisionIndex = index => {
        updateRevisionIndex(() => index)
      }

      const navigation = this.state.history && React.DOM.div(
        { style: { position: 'absolute' } },
        React.DOM.button({
          onClick: () => setRevisionIndex(0),
          disabled: this.getIndexAsNumber(this.state.currentRevisionIndex) === 0,
        }, '⇤'),
        React.DOM.button({
          onClick: () => updateRevisionIndex(x => x - 1),
          disabled: this.getIndexAsNumber(this.state.currentRevisionIndex) === 0,
        }, '←'),
        React.DOM.button({
          onClick: () => updateRevisionIndex(x => x + 1),
          disabled: this.getIndexAsNumber(this.state.currentRevisionIndex) === this.state.history.length - 1,
        }, '→'),
        React.DOM.button({
          onClick: () => setRevisionIndex('last'),
          disabled: this.getIndexAsNumber(this.state.currentRevisionIndex) === this.state.history.length - 1,
        }, '⇥'),
      )

      const props = Object.assign({ ref }, this.state.history ? this.getCurrentRevision(this.state).props : this.props)
      return React.DOM.span(
        null,
        navigation,
        React.createElement(ComponentClass, props)
      )
    }

    getIndexAsNumber(index) {
      return index === 'last'
        ? this.state.history.length - 1
        : index
    }

    getCurrentRevision(state) {
      return state.history[this.getIndexAsNumber(state.currentRevisionIndex)]
    }
  }
}

import { last } from './utils.js'

export function timeTravel(ComponentClass) {
  return class TimeTravel extends ComponentClass {
    constructor() {
      super()
      this.initHistory = ({ state, props }) => {
        if (this.history) return
        this.history = [{ state, props }]
      }

      this.revision = ({ props, statePatch }) => {
        const prevRecord = last(this.history)
        const newRecord = {
          props: props
            ? props
            : prevRecord.props,
          state: statePatch
            ? Object.assign({}, prevRecord.state, statePatch)
            : prevRecord.state
        }
        this.history.push(newRecord)
      }
      window.___getHistory = () => this.history
    }

    componentWillUpdate(nextProps) {
      this.revision({ props: nextProps })
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
        if (!node) return

        this.initHistory({ props: this.props, state: node.state })
        const originalSetState = node.setState.bind(node)
        if (!node.isPatchedByReactTimeTravel) {
          node.setState = patchSetState(originalSetState)
          node.isPatchedByReactTimeTravel = true
        }
      }

      const props = Object.assign({ ref }, this.props)
      return React.createElement(ComponentClass, props)
    }
  }
}

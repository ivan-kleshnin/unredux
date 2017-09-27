import R from "ramda"
import React, {Component} from "react"
import combineLatestObj from "./combineLatestObj"

export default function connect(streamsToProps, ComponentToWrap) {
  class Container extends Component {
    state = {} // will be replaced with initialState on componentWillMount (before first render)

    componentWillMount() {
      let props = combineLatestObj(streamsToProps)
      this.$ = props.subscribe((data) => {
        this.setState(data)
      })
    }

    componentWillUnmount() {
      this.$.unsubscribe()
    }

    render() {
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }
  return Container
}


import * as R from "ramda"
import {Component} from "react"
import {combineLatestObj} from "./utils"

export default function connect(streamsToProps, ComponentToWrap) {
  class Container extends Component {
    constructor(props) {
      super(props)
      this.state = {} // will be replaced with seed on componentWillMount (before first render)
    }

    componentWillMount() {
      let props = combineLatestObj(streamsToProps)
        .throttleTime(10, undefined, {leading: true, trailing: true}) // RxJS throttle is half-broken (https://github.com/ReactiveX/rxjs/search?q=throttle&type=Issues)
      this.sb = props.subscribe((data) => {
        this.setState(data)
      })
    }

    componentWillUnmount() {
      this.sb.unsubscribe()
    }

    render() {
      return React.createElement(ComponentToWrap, R.merge(this.props, this.state), this.props.children)
    }
  }
  return Container
}


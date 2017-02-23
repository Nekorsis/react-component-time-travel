
# React Component Time Travel
> Proof of concept time traveling for React Component

![demo](http://s.csssr.ru/U09LGPMEU/20170223081516.gif)

[Demo page](https://nitive.github.io/react-component-time-travel/)
> Demo requires ES Modules browser support to works.
> It currently works in Safari TP and Edge.

External API:
```jsx
import { timeTravel } from './react-component-time-travel.js' // not published yet

function App() {
  const CounterWithTimeTravel = timeTravel(Counter) // Wrap into HOC

  return (
    <div>
      // Use as usual Counter component
      <CounterWithTimeTravel color="tomato" />
    </div>
  )
}
```

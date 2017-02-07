# @jam3/gsap-promise

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A Promise wrapper around gsap / tweenlite. 

```js
var animate = require('gsap-promise')

Promise.all([
	animate(element, 1.0, { x: 10 }),
	animate(element, 1.0, { y: 10, delay: 0.5 })
]).then(function() {
	console.log("all animations finished")
})
```

**Note:** Version 2.x uses `global.Promise` (you will need to polyfill it yourself). If you want a promise implementation, switch to 1.x which defaults to using Bluebird.

## Usage

[![NPM](https://nodei.co/npm/gsap-promise.png)](https://nodei.co/npm/gsap-promise/)

This promisifies the `TweenMax` methods: `to`, `from`, `set` and `fromTo`.

#### ```animate.to(element, duration, params)```
#### ```animate.from(element, duration, from)```
#### ```animate.set(element, params)```
#### ```animate.fromTo(element, duration, from, to)```
#### ```animate.staggerFromTo(element, duration, from, to, stagger)```
#### ```animate.staggerFrom(element, duration, from, stagger)```
#### ```animate.staggerTo(element, duration, to, stagger)```

Matches the TweenMax methods by the same name, but returns a Promise for the onComplete event. 

#### ```animate.all(element)```

An alias for `Promise.all`, which will trigger all tweens in parallel.

#### ```animate.killTweensOf(elements)```

An alias for `gsap.killTweensOf(elements)`.

#### ```animate(element, duration, params)```

The default export is the same as `animate.to`.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/gsap-promise/blob/master/LICENSE.md) for details.

var assign = require('object-assign')
var noop = function () {}

module.exports = function(Promise, TweenMax) {
	function animateFunc(func, element, duration, opts) {
		opts = assign({}, opts)
		guardAgainstNull(element)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapCompletion(opts, resolve, opts)
			wrapTween(func(element, duration, opts), resolve, opts)
		})
	}

	var animateTo = animateFunc.bind(null, TweenMax.to)

	var util = animateTo
	util.to = animateTo
	util.from = animateFunc.bind(null, TweenMax.from)
	
	util.set = function animateSet(element, opts) {
		opts = assign({}, opts)
		guardAgainstNull(element)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapCompletion(opts, resolve, opts)
			wrapTween(TweenMax.set(element, opts), resolve, opts)
		})
	}

	util.fromTo = function animateFromTo(element, duration, from, to) {
		to = assign({}, to)
		guardAgainstNull(element)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapCompletion(to, resolve, from)
			wrapTween(TweenMax.fromTo(element, duration, from, to), resolve, from)
		})
	}

	;['staggerTo', 'staggerFrom'].forEach(function(fn) {
		var tweenFunc = TweenMax[fn]
		util[fn] = function(element, duration, from, stagger) {
			guardAgainstNull(element)
			return new Promise(function(resolve) {
				resolve = once(resolve)
				wrapTween(tweenFunc(element, duration, from, stagger, resolve), resolve, from)
			})
		}
	})

	util.staggerFromTo = function staggerFromTo(element, duration, from, to, stagger) {
		guardAgainstNull(element)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapTween(TweenMax.staggerFromTo(element, duration, from, to, stagger, resolve), resolve, from)
		})
	}

	util.killTweensOf = TweenMax.killTweensOf.bind(TweenMax)
	util.all = Promise.all

	// expose original gsap for non-promise interface
	util.TweenMax = TweenMax
	return util

	function once (resolve) {
		// call resolve only once
		var done = function (ev) {
			resolve(ev)
			resolve = noop
		}
		return done
	}

	function guardAgainstNull (el) {
		if (!el) throw new Error('gsap: Cannot tween a null target')
		if (Array.isArray(el)) {
			const isFalsey = el.some(function (e) {
				return !e
			})
			if (isFalsey) {
				throw new Error('gsap: Cannot tween a null target - ' + 
					' some elements in the array are undefined.')
			}
		}
	}

	function wrapCompletion (p, done, opts) {
		opts = opts || {}
		p.onComplete = done
		if (!opts || !opts.callThenOnKill) return
		p.onOverwrite = done
	}

	function wrapTween (tween, resolve, opts) {
		opts = opts || {}
		if (!opts || !opts.callThenOnKill) return
		delete opts.callThenOnKill

		// GSAP won't call onComplete or onOverwrite with { override: 'all' }
		if (typeof tween._kill === 'function' && !tween._isGSAPPromiseWrapped) {
			tween._isGSAPPromiseWrapped = true
			var oldKill = tween._kill
			tween._kill = function (vars) {
				var self = this
				var args = Array.prototype.slice.call(arguments)
				if (vars === 'all' || vars === null || typeof vars === 'undefined') {
					process.nextTick(function () {
						resolve(self)
					})
				}
				return oldKill.apply(this, args)
			}
		}
	}
}
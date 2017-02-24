var TweenMax = require('gsap')
var assign = require('object-assign')
var noop = function () {}

module.exports = function(Promise) {
	function animateFunc(func, element, duration, opts) {
		opts = assign({}, opts)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapCompletion(opts, resolve)
			wrapTween(func(element, duration, opts), resolve)
		})
	}

	var animateTo = animateFunc.bind(null, TweenMax.to)

	var util = animateTo
	util.to = animateTo
	util.from = animateFunc.bind(null, TweenMax.from)
	
	util.set = function animateSet(element, opts) {
		opts = assign({}, opts)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapCompletion(opts, resolve)
			wrapTween(TweenMax.set(element, opts), resolve)
		})
	}

	util.fromTo = function animateFromTo(element, duration, from, to) {
		to = assign({}, to)
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapCompletion(to, resolve)
			wrapTween(TweenMax.fromTo(element, duration, from, to), resolve)
		})
	}

	;['staggerTo', 'staggerFrom'].forEach(function(fn) {
		var tweenFunc = TweenMax[fn]
		util[fn] = function(element, duration, from, stagger) {
			return new Promise(function(resolve) {
				resolve = once(resolve)
				wrapTween(tweenFunc(element, duration, from, stagger, resolve), resolve)
			})
		}
	})

	util.staggerFromTo = function staggerFromTo(element, duration, from, to, stagger) {
		return new Promise(function(resolve) {
			resolve = once(resolve)
			wrapTween(TweenMax.staggerFromTo(element, duration, from, to, stagger, resolve), resolve)
		})
	}

	util.killTweensOf = TweenMax.killTweensOf.bind(TweenMax)
	util.all = Promise.all

	// expose original gsap for non-promise interface
	util.gsap = gsap;
	return util

	function once (resolve) {
		// call resolve only once
		var done = function (ev) {
			resolve(ev)
			resolve = noop
		}
		return done
	}

	function wrapCompletion (p, done) {
		// handle both completion events
		p.onComplete = done
		p.onOverwrite = done
	}

	function wrapTween (tween, resolve) {
		// GSAP won't call onComplete or onOverwrite with { override: 'all' }
		if (typeof tween._kill === 'function' && !tween._isGSAPPromiseWrapped) {
			tween._isGSAPPromiseWrapped = true;
			var oldKill = tween._kill;
			tween._kill = function (vars) {
				var self = this
				var args = Array.prototype.slice.call(arguments);
				if (vars === 'all' || vars === null || typeof vars === 'undefined') {
					process.nextTick(function () {
						resolve(self)
					})
				}
				return oldKill.apply(this, args);
			}
		}
	}
}
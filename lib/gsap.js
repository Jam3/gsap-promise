const TweenLite = require('./TweenLite');
require('./plugins/CSSPlugin');

const eases = require('eases');

// inject some default eases
const dict = TweenLite.Ease.map;
Object.keys(eases).forEach(function (ease) {
  dict[ease] = new TweenLite.Ease(eases[ease]);
});

module.exports = TweenLite;
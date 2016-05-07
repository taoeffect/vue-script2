/*!
  * vue-script2 v1.0.0
  * (c) 2016 Greg Slepak
  * @license MIT License
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueScript2 = factory());
}(this, function () { 'use strict';

  // To use, just:
  //
  // 1. search-replace "<script " with "<script2 "
  // 2. search-replace "</script>" with "</script2>"

  var Script2 = {
    installed: false,
    p: Promise.resolve(),
    version: '1.0.0', // grunt will over write to match package.json
    loaded: {} // keys are the scripts that have been loaded
  };

  Script2.install = function (Vue) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (Script2.installed) return;
    var customAttrs = ['unload'];
    // from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
    // don't have 'async' or 'defer' bc those don't allow document.write according to:
    // http://www.html5rocks.com/en/tutorials/speed/script-loading/
    var props = customAttrs.concat(['src', 'type', 'integrity', 'text', 'crossorigin']);
    Vue.component('script2', {
      props: props,
      // <slot> is important, see: http://vuejs.org/guide/components.html#Named-Slots
      template: '<div style="display:none"><slot></slot></div>',
      ready: function ready() {
        var _this = this;

        var parent = this.$el.parentElement;
        if (!this.src) {
          Script2.p = Script2.p.then(function () {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.appendChild(document.createTextNode(_this.$el.innerHTML));
            parent.appendChild(s);
          });
        } else if (!Script2.loaded[this.src]) {
          var params = _.omitBy(_.pick(this, props), _.isUndefined);
          Script2.loaded[this.src] = true;
          // seralizes execution. note this syntax does an implicit return
          Script2.p = Script2.p.then(function () {
            return insertScript(parent, _this.src, params);
          });
        }
        Vue.util.remove(this.$el); // remove dummy template <div>
      },
      destroyed: function destroyed() {
        if (this.unload) {
          new Function(this.unload)(); // eslint-disable-line
          delete Script2.loaded[this.src];
        }
      }
    });

    Script2.installed = true;
  };

  var _ = {
    isUndefined: function isUndefined(x) {
      return x === undefined;
    },
    pick: function pick(o, props) {
      var x = {};
      props.forEach(function (k) {
        return x[k] = o[k];
      });
      return x;
    },
    omit: function omit(o, props) {
      var x = {};
      Object.keys(o).forEach(function (k) {
        if (props.indexOf(k) === -1) x[k] = o[k];
      });
      return x;
    },
    omitBy: function omitBy(o, pred) {
      var x = {};
      Object.keys(o).forEach(function (k) {
        if (!pred(o[k])) x[k] = o[k];
      });
      return x;
    },

    // custom defaults function suited to our specific purpose
    defaults2: function defaults2(o) {
      for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      sources.forEach(function (s) {
        Object.keys(s).forEach(function (k) {
          if ((_.isUndefined(o[k]) || o[k] === '') && s[k] !== '') {
            o[k] = s[k];
          }
        });
      });
    }
  };

  function insertScript(el, src) {
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return new Promise(function (resolve, reject) {
      var _this2 = this;

      var s = document.createElement('script');
      // omit the special options that Script2 supports
      _.defaults2(s, _.omit(opts, ['unload']), {
        type: 'text/javascript'
      });
      // according to: http://www.html5rocks.com/en/tutorials/speed/script-loading/
      // async does not like 'document.write' usage, which we & vue.js make
      // heavy use of based on the SPA style. Also, async can result
      // in code getting executed out of order from how it is inlined on the page.
      s.async = false; // therefore set this to false
      s.src = src;
      // inspiration from: https://github.com/eldargab/load-script/blob/master/index.js
      // and: https://github.com/ded/script.js/blob/master/src/script.js#L70-L82
      function success() {
        resolve(src);
      }
      s.onload = success;
      s.onreadystatechange = function () {
        return _this2.readyState === 'complete' && success();
      }; // IE
      s.onerror = function () {
        return reject(new Error('failed to load:' + src));
      };
      el.appendChild(s);
    });
  }

  return Script2;

}));
/*!
  * vue-script2 v2.0.1
  * (c) 2016-2017 Greg Slepak
  * @license MIT License
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueScript2 = factory());
}(this, function () { 'use strict';

  var Script2 = {
    installed: false,
    p: Promise.resolve(),
    version: '2.0.1', // grunt will overwrite to match package.json
    loaded: {}, // keys are the scripts that have been loaded
    install: function install(Vue) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (Script2.installed) return;
      var customAttrs = ['unload'];
      // from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
      // 'async' and 'defer' don't allow document.write according to:
      // http://www.html5rocks.com/en/tutorials/speed/script-loading/
      // we ignore 'defer' and handle 'async' specially.
      var props = customAttrs.concat(['src', 'type', 'async', 'integrity', 'text', 'crossorigin']);
      Vue.component('script2', {
        props: props,
        // <slot> is important, see: http://vuejs.org/guide/components.html#Named-Slots
        template: '<div style="display:none"><slot></slot></div>',
        // NOTE: I tried doing this with Vue 2's new render() function.
        //       It was a nightmare and I never got it to work.
        mounted: function mounted() {
          var _this = this;

          var parent = this.$el.parentElement;
          if (!this.src) {
            Script2.p = Script2.p.then(function () {
              var s = document.createElement('script');
              s.type = 'text/javascript';
              s.appendChild(document.createTextNode(_this.$el.innerHTML));
              parent.appendChild(s);
            });
          } else {
            var opts = _.omitBy(_.pick(this, props), _.isUndefined);
            opts.parent = parent;
            // this syntax results in an implicit return
            var load = function load() {
              return Script2.load(_this.src, opts);
            };
            _.isUndefined(this.async) ? Script2.p = Script2.p.then(load) // serialize execution
            : load(); // inject immediately
          }
          // see: https://vuejs.org/v2/guide/migration.html#ready-replaced
          this.$nextTick(function () {
            // code that assumes this.$el is in-document
            _this.$el.remove(); // remove dummy template <div>
          });
        },
        destroyed: function destroyed() {
          if (this.unload) {
            new Function(this.unload)(); // eslint-disable-line
            delete Script2.loaded[this.src];
          }
        }
      });
      Script2.installed = true;
    },
    load: function load(src) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? { parent: document.head } : arguments[1];

      return Script2.loaded[src] ? Promise.resolve(src) : new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        // omit the special options that Script2 supports
        _.defaults2(s, _.omit(opts, ['unload', 'parent']), { type: 'text/javascript' });
        // according to: http://www.html5rocks.com/en/tutorials/speed/script-loading/
        // async does not like 'document.write' usage, which we & vue.js make
        // heavy use of based on the SPA style. Also, async can result
        // in code getting executed out of order from how it is inlined on the page.
        s.async = false; // therefore set this to false
        s.src = src;
        // crossorigin in HTML and crossOrigin in the DOM per HTML spec
        // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-crossorigin
        if (opts.crossorigin) {
          s.crossOrigin = opts.crossorigin;
        }
        // inspiration from: https://github.com/eldargab/load-script/blob/master/index.js
        // and: https://github.com/ded/script.js/blob/master/src/script.js#L70-L82
        s.onload = function () {
          Script2.loaded[src] = 1;resolve(src);
        };
        // IE should now support onerror and onload. If necessary, take a look
        // at this to add older IE support: http://stackoverflow.com/a/4845802/1781435
        s.onerror = function () {
          return reject(new Error(src));
        };
        opts.parent.appendChild(s);
      });
    }
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
          if (_.isUndefined(o[k]) || o[k] === '') o[k] = s[k];
        });
      });
    }
  };

  return Script2;

}));
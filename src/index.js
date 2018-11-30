var Script2 = {
  installed: false,
  p: Promise.resolve(),
  version: '2.0.3', // grunt will overwrite to match package.json
  loaded: {}, // keys are the scripts that have been loaded
  install (Vue, options = {}) {
    if (Script2.installed) return
    var customAttrs = ['unload']
    // from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
    // 'async' and 'defer' don't allow document.write according to:
    // http://www.html5rocks.com/en/tutorials/speed/script-loading/
    // we ignore 'defer' and handle 'async' specially.
    var props = customAttrs.concat(['src', 'type', 'async', 'integrity', 'text', 'crossorigin'])
    Vue.component('script2', {
      props: props,
      // <slot> is important, see: http://vuejs.org/guide/components.html#Named-Slots
      // template: '<div style="display:none"><slot></slot></div>',
      // NOTE: Instead of using `template` we can use the `render` function like so:
      render (h) { return h('div', {style: 'display:none'}, this.$slots.default) },
      mounted () {
        var parent = this.$el.parentElement
        if (!this.src) {
          Script2.p = Script2.p.then(() => {
            var s = document.createElement('script')
            var h = this.$el.innerHTML
            h = h.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
            s.type = 'text/javascript'
            s.appendChild(document.createTextNode(h))
            parent.appendChild(s)
          })
        } else {
          var opts = _.omitBy(_.pick(this, props), _.isUndefined)
          opts.parent = parent
          // this syntax results in an implicit return
          var load = () => Script2.load(this.src, opts)
          _.isUndefined(this.async)
            ? Script2.p = Script2.p.then(load) // serialize execution
            : load()                           // inject immediately
        }
        // see: https://vuejs.org/v2/guide/migration.html#ready-replaced
        this.$nextTick(() => {
          // code that assumes this.$el is in-document
          // NOTE: we could've done this.$el.remove(), but IE sucks, see:
          //       https://github.com/taoeffect/vue-script2/pull/17
          this.$el.parentElement.removeChild(this.$el) // remove dummy template <div>
        })
      },
      destroyed () {
        if (this.unload) {
          new Function(this.unload)() // eslint-disable-line
          delete Script2.loaded[this.src]
        }
      }
    })
    Script2.installed = true
  },
  load (src, opts = {parent: document.head}) {
    if (!Script2.loaded[src]) Script2.loaded[src] = new Promise((resolve, reject) => {
      var s = document.createElement('script')
      // omit the special options that Script2 supports
      _.defaults2(s, _.omit(opts, ['unload', 'parent']), {type: 'text/javascript'})
      // according to: http://www.html5rocks.com/en/tutorials/speed/script-loading/
      // async does not like 'document.write' usage, which we & vue.js make
      // heavy use of based on the SPA style. Also, async can result
      // in code getting executed out of order from how it is inlined on the page.
      s.async = false // therefore set this to false
      s.src = src
      // crossorigin in HTML and crossOrigin in the DOM per HTML spec
      // https://html.spec.whatwg.org/multipage/embedded-content.html#dom-img-crossorigin
      if (opts.crossorigin) {
        s.crossOrigin = opts.crossorigin
      }
      // inspiration from: https://github.com/eldargab/load-script/blob/master/index.js
      // and: https://github.com/ded/script.js/blob/master/src/script.js#L70-L82
      s.onload = () => resolve(src)
      // IE should now support onerror and onload. If necessary, take a look
      // at this to add older IE support: http://stackoverflow.com/a/4845802/1781435
      s.onerror = () => reject(new Error(src))
      opts.parent.appendChild(s)
    })
    return Script2.loaded[src]
  }
}

var _ = {
  isUndefined (x) { return x === undefined },
  pick (o, props) {
    var x = {}
    props.forEach(k => { x[k] = o[k] })
    return x
  },
  omit (o, props) {
    var x = {}
    Object.keys(o).forEach((k) => { if (props.indexOf(k) === -1) x[k] = o[k] })
    return x
  },
  omitBy (o, pred) {
    var x = {}
    Object.keys(o).forEach((k) => { if (!pred(o[k])) x[k] = o[k] })
    return x
  },
  // custom defaults function suited to our specific purpose
  defaults2 (o, ...sources) {
    sources.forEach((s) => {
      Object.keys(s).forEach((k) => {
        if (_.isUndefined(o[k]) || o[k] === '') o[k] = s[k]
      })
    })
  }
}

export default Script2

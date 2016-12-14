# VueScript2 - Simple, Familiar Asynchronous Script Loading

VueScript2 brings back the `<script>` tag to your SPA (Single Page App)!

This tiny library should take care of all your [declarative](#familiar-declarative-asynchronous-loading-of-scripts) and [imperative](#promise-based-imperative-loading-too) asynchronous loading needs. Web designers can rest easy knowing their existing knowledge of web development is still useful!

This version is tailored for the [Vue.js](http://vuejs.org) framework, but it's easy to port to [Riot.js](http://riotjs.com) and others.

VueScript2 is primarily for internal use and not for standalone components that are being shared publicly. Those should be "self-contained" and come with all the JS they need.

***NOTE:*** _Requires Vue 2.x. Use version 1.2.2 for Vue 1.x._

## Features

- Just like `<script>` except with a `2`, but [even that can be fixed!](#writing-script-instead-of-script2-using-script2ify)
- Keep your `app.js` bundle small!
- Embrace Web Standards™ everyone knows and loves!
- Easy for web designers to pick up! If you know HTML, you already know how to use it!
- Tiny! Only __1kb__! (min+gzip'd)
- Perfect for use in `.ejs` templates or `.html` files!
- No more including every library on every page or complicated "code splitting"!
- Ordered execution based on position in markup!
- Special [`unload` attribute](#cleanup-unused-resources-with-the-unload-attribute) can be used to keep your app's memory usage low!
- Does [imperative loading](#promise-based-imperative-loading-too) too!

## Installation

```
npm install vue-script2 --save
```

Then enable the plugin (in your `main.js` or wherever):

```js
Vue.use(require('vue-script2'))
```

## Usage

_Note: you can write_ __*`<script>`*__ *instead of* __*`<script2>`*__ _using [`script2ify`!](#writing-script-instead-of-script2-using-script2ify)_ :smile:

##### Familiar, declarative, asynchronous loading of scripts

Using `vue-script2` with [`vue-router`](https://github.com/vuejs/vue-router) is simple. Say that only one of your routes displays a "page" that makes use of jQuery. Well, no need to include all of jQuery in your `app.js` bundle, now you can throw this in:

```html
<script2 src="/path/to/jquery.min.js"></script2>
```

Boom!

And don't worry, `script2` won't re-download scripts if they're already loaded.

##### Promise-based imperative loading too!

Imperatively load scripts with `VueScript2.load`:

```js
VueScript2.load('/path/to/jquery.min.js').then(function () {
  $('#msg').text('Hello from VueScript2!')
})
```

For 99% of use-cases this is totally sufficient and you do not need the overhead of RequireJS or SystemJS or whatever else. That's especially true given that Vue.js is normally used with Browserify or Webpack, which handle complicated dependency management for you.

_NOTE: scripts injected using `VueScript2.load` are always [`async`](#special-support-for-async-attribute)._

##### Delayed execution of inlined JavaScript

Want to run some JavaScript only when a specific "page"/route is visited and only after a library has finished loading? Simple!

```html
<script2 src="/path/to/jquery.min.js"></script2>
<script2>
// Ordered execution should ensure that '$' is available here
$(document).ready(function () {
  // this code runs *only* when the route
  // that contains this code is loaded! :D->-<
})
</script2>
```

##### Cleanup unused resources with the `unload` attribute

The `unload` attribute accepts JS expressions to run when the component is destroyed. This prevents your SPA from accumulating stuff in memory that's not being used:

```html
<script2 src="/path/to/jquery.min.js" unload="jQuery.noConflict(true)"></script2>
```

##### Special support for `async` attribute

Although technically all scripts are inserted with `s.async = false` (since we're using `document.write`, see [this wonderful article](http://www.html5rocks.com/en/tutorials/speed/script-loading/) by [Jake Archibald](https://twitter.com/jaffathecake) for details), setting the `async` attribute does make a meaningful difference.

By default, the loading of `<script2>` tags is serialized using promises so that one script loads after another has finished. If you don't care about the loading order, add `async` to have the script injected into the page immediately.

You can mix and match so that some `<script2>` tags are loaded immediately while others wait for the ones before them:

```html
<script2 src="jquery.min.js"></script2>
<script2>$('#foo').text('hi!')</script2>
<!-- Load next script immediately, don't wait for jQuery -->
<script2 src="lib.js" async></script2>
```

## Writing `<script>` instead of `<script2>` using `script2ify`

The `script2ify` [browserify](https://github.com/substack/node-browserify) transform below will (fairly safely) dynamically replace `<script>` tags with `<script2>` tags within `.ejs`, `.html`, and even `.vue` files!

```js
var through = require('through2')
// This will replace <script> with <script2> in .html, .vue and .ejs files
// EXCEPT:
// - within <!-- comments -->
// - top-level <script> tags within .vue files
// Additional exclusion per: http://www.rexegg.com/regex-best-trick.html
// Excluding <pre> tags did not seem to work, however.
function script2ify (file) {
  return !/\.(vue|html|ejs)$/.test(file) // edit to support other file types
  ? through()
  : through(function (buf, encoding, cb) {
    // avoid replacing top-level <script> tags in .vue files
    var regex = /\.vue$/.test(file)
    ? /<!--.*?-->|^<script>|^<\/script>|(?:<(\/)?script([ >]))/gm
    : /<!--.*?-->|(?:<(\/)?script([ >]))/gm
    var replacement = (m, p1, p2) => p2 ? `<${p1 || ''}script2${p2}` : m
    cb(null, buf.toString('utf8').replace(regex, replacement))
  })
}
```

### TODO

- [ ] Add tests + Travis CI. Not much to test though.

## History

- __2.0.0__ - Vue 2.x compatible. Requires Vue 2.x. Use 1.2.2 for Vue 1.x.
- __1.2.2__ - Fixes broken `crossorigin` attribute (thx @grempe!)
- __1.2.1__ - Just a bit of perfectionism to fix a non-issue issue
- __1.2.0__ - Added `VueScript2.load` imperative loading
- __1.1.2__ - Another bump to get npm.org to display `script2ify` in the README
- __1.1.1__ - Identical to `1.1.0`, just adds needed package.json info.
- __1.1.0__ - Adds special support for `async` attribute.
- __1.0.0__ - Initial release.

# License

[MIT](http://opensource.org/licenses/MIT)

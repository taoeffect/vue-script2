# vue-script2

Fully restores the `<script>` tag to front-end single-page-app (SPA) frameworks! This version is for [Vue.js](http://vuejs.org), but it's easy to port to [Riot.js](http://riotjs.com) and others.

It's meant for internal use, not for standalone components that are being shared publicly. Those should be "self-contained" and come with all the JS they need.

## Features

- Just like `<script>` except with a `2`, but [even that can be fixed!](#using-script-via-browserify-transform)
- Keep your `app.js` bundle small!
- Embrace Web Standards™ everyone knows and loves!
- Easy for web designers to pick up! If you know HTML, you already know how to use it!
- Tiny! Only __1kb__! (min+gzip'd)
- Perfect for use in `.ejs` templates or `.html` files!
- No more including every library on every page or complicated "code splitting"!
- Ordered execution based on position in markup!
- Special `unload` attribute can be used to keep your app's memory usage low!

## Installation

```
npm install vue-script2 --save
```

Then enable the plugin (in your `main.js` or wherever):

```js
Vue.use(require('vue-script2'))
```

## Usage

*Note: all of the examples below use `<script2>`, but you can write `<script>` instead by using the [`script2ify` browserify transform provided below!](#using-script-via-browserify-transform)* :smile:

__Simple, Traditional, Asynchronous Loading of Scripts__

Using `vue-script2` with [`vue-router`](https://github.com/vuejs/vue-router) is simple. Say that only one of your routes displays a "page" that makes use of jQuery. Well, no need to include all of jQuery in your `app.js` bundle, now you can throw this in:

```html
<script2 src="/path/to/jquery.min.js"></script2>
```

Boom!

And don't worry, `script2` won't re-download scripts if they're already loaded.

__Delayed Execution of Inlined JavaScript__

Want to run some JavaScript only when a certain "page"/route is loaded?

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

__Cleaning Up Resources On Route Change__

The `unload` attribute accepts JS expressions to run when the component is destroyed. This prevents your SPA from accumulating stuff in memory that's not being used:

```html
<script2 src="/path/to/jquery.min.js" unload="jQuery.noConflict(true)"></script2>
```

__Special support for `async` attribute__

Although technically all scripts are inserted with `s.async = false` (since we're using `document.write`, see [this wonderful article](http://www.html5rocks.com/en/tutorials/speed/script-loading/) by [Jake Archibald](https://twitter.com/jaffathecake) for details), setting the `async` attribute does make a meaningful difference.

By default, the loading of `<script2>` tags is serialized using promises so that one script loads after another has finished. If you don't care about the loading order, add `async` to have the script injected into the page immediately.

You can mix and match so that some `<script2>` tags are loaded immediately while others wait for the ones before them:

```html
<script2 src="jquery.min.js"></script2>
<script2>$('#foo').text('hi!')</script2>
<!-- Load next script immediately, don't wait for jQuery -->
<script2 src="lib.js" async></script2>
```

## Using `<script>` via browserify transform

The `script2ify` browserify transform below will (fairly safely) dynamically replace `<script>` tags with `<script2>` tags within `.ejs`, `.html`, and even `.vue` files!

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

- __1.1.2__ - Another bump to get npm.org to display `script2ify` in the README
- __1.1.1__ - Identical to `1.1.0`, just adds needed package.json info.
- __1.1.0__ - Adds special support for `async` attribute.
- __1.0.0__ - Initial release.

# License

[MIT](http://opensource.org/licenses/MIT)

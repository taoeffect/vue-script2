# vue-script2

Fully restores the `<script>` tag to front-end single-page-app (SPA) frameworks! This version is for [Vue.js](http://vuejs.org), but it's easy to port to [Riot.js](http://riotjs.com) and others.

It's meant for internal use, not for standalone components that are being shared publicly. Those should be "self-contained" and come with all the JS they need.

## Features

- Just like `<script>` except with a `2`!<sup>1</sup>
- Keep your `app.js` bundle small!
- Embrace Web Standards™ everyone knows and loves!
- Easy for web designers to pick up! If you know HTML, you already know how to use it!
- Tiny! Only __996 bytes__! (min+gzip'd)
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

### TODO

- [ ] Add tests + Travis CI. Not much to test though.

# License

[MIT](http://opensource.org/licenses/MIT)

<sup>1</sup> *<span style="font-size:50%">If you don't like the `2` at the end, feel free to petition your favorite SPA framework to add native support.</span>*
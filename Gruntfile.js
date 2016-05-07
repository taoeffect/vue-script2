var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')
var fs = require('fs')

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)

  var pkg = grunt.file.readJSON('package.json')
  var file = pkg['jsnext:main']
  var main = fs.readFileSync(file, 'utf-8')
  var v1 = main.match(/version: '([\d\.]+)'/)[1]
  if (v1 !== pkg.version) {
    console.log(`Updating version in ${file}: ${v1} => ${pkg.version}`)
    main = main.replace(`version: '${v1}'`, `version: '${pkg.version}'`)
    fs.writeFileSync(file, main)
  }

  var year = new Date().getFullYear()
  year = year === 2016 ? year : `2016-${year}`
  var banner = `/*!
  * ${pkg.name} v${pkg.version}
  * (c) ${year} Greg Slepak
  * @license MIT License
  */`

  function merge (o, s) {
    var x = {}
    Object.keys(o).forEach((k) => x[k] = s[k] ? s[k] : o[k])
    return x
  }

  var opts = {
    format: 'umd',
    moduleName: camelCase(pkg.name),
    plugins: [babel({presets: ['es2015-rollup']})],
    banner: banner
  }

  grunt.initConfig({
    pkg: pkg,
    checkDependencies: {this: {options: {install: true}}},
    rollup: {
      umd: {
        options: opts,
        files: { 'dist/<%= pkg.name %>.js': ['src/index.js'] }
      },
      ugly: {
        options: merge(opts, {plugins: [...opts.plugins, uglify({
          output: {preamble: banner}
        })]}),
        files: { 'dist/<%= pkg.name %>.min.js': ['src/index.js'] }
      }
    },
    standard: { dev: {} }
  })
  grunt.registerTask('default', ['standard', 'rollup'])
}

function camelCase (s) {
  return s.replace(/(?:^|[-_\/])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

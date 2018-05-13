const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const fs = require('fs')

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)

  var pkg = grunt.file.readJSON('package.json')
  var file = pkg['jsnext:main']
  var main = fs.readFileSync(file, 'utf-8')
  var v1 = main.match(/version: '([\d.]+)'/)[1]
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

  function pick (o, props) {
    var x = {}
    props.forEach(k => { x[k] = o[k] })
    return x
  }

  grunt.initConfig({
    pkg: pkg,
    checkDependencies: {this: {options: {install: true}}},
    rollup: {
      umd: {
        input: 'src/index.js',
        plugins: [babel({exclude: './node_modules/**'})],
        output: {
          file: `dist/${pkg.name}.js`,
          format: 'umd',
          name: camelCase(pkg.name),
          banner
        }
      },
      ugly: {
        input: 'src/index.js',
        plugins: [
          babel({exclude: './node_modules/**'}),
          uglify({output: {preamble: banner}})
        ],
        output: {
          file: `dist/${pkg.name}.min.js`,
          format: 'umd',
          name: camelCase(pkg.name)
        }
      }
    },
    standard: { dev: {} }
  })

  grunt.registerMultiTask('rollup', async function () {
    // grunt.log.writeln(this.target + ': ', this.data)
    var done = this.async()
    // https://rollupjs.org/guide/en#javascript-api
    const bundle = await rollup.rollup(pick(this.data, ['input', 'plugins']))
    await bundle.write(this.data.output)
    done()
  })

  grunt.registerTask('default', ['standard', 'rollup'])
}

function camelCase (s) {
  return s.replace(/(?:^|[-_/])(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

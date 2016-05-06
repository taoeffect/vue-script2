var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)

  var plugins = [babel({presets: ['es2015-rollup']})]
  var plugins_uglify = plugins.concat([uglify()])

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    checkDependencies: {this: {options: {install: true}}},
    rollup: {
      options: { plugins: plugins },
      umd: {
        options: {
          format: 'umd',
          moduleName: '<%= pkg.name %>'
        },
        files: { 'dist/bundle.umd.js': ['src/index.js'] }
      },
      ugly: {
        options: {
          format: 'umd',
          moduleName: '<%= pkg.name %>',
          plugins: plugins_uglify
        },
        files: { 'dist/bundle.umd.min.js': ['src/index.js'] }
      },
      es6: {
        options: { format: 'es6' },
        files: { 'dist/bundle.es6.js': ['src/index.js'] }
      }
    },
    standard: { dev: {} }
  })
  grunt.registerTask('default', ['standard', 'rollup'])
}

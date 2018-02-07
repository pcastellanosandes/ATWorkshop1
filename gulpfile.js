var gulp = require('gulp')
gulp.task('generate-service-worker', function(callback) {
    var swPrecache = require('sw-precache');
    var rootDir = 'workshop1';
  
    swPrecache.write(`${rootDir}/service-worker.js`, {
      staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
      stripPrefix: rootDir
    }, callback);
  });
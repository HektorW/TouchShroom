
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');




gulp.task('default', function() {

  return gulp.src('client/js/main.js', { read: false })
    .pipe(browserify({
        transform: ['babelify'],
        debug: true // Enable sourcemaps
      }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('client'));
});
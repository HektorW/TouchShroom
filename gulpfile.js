

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');


gulp.plumbedSrc = function() {
  return gulp.src.apply(gulp, arguments)
    .pipe(plumber());
};

gulp.watchReload = function(src, deps) {
  gulp.watch(src, deps) .on('change', function() {
    gulp.src(src).pipe(connect.reload());
  });
};



// Babel & Browserify
gulp.task('babelify', function() {
  return gulp.plumbedSrc('client/scripts/main.js', { read: false })
    .pipe(browserify({
        transform: ['babelify'],
        debug: true // Enable sourcemaps
      }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('client'));
});


// Less
gulp.task('less', function() {
  return gulp.plumbedSrc('client/styles/main.less')
    .pipe(sourcemaps.init())
      .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('client'));
});


// Server - connect
gulp.task('connect', function() {
  connect.server({
    root: 'client/',
    port: 8080,
    livereload: true
  });
});

// Watch
gulp.task('watch', function() {
  gulp.watchReload(['client/scripts/**/*.js'], ['babelify']);
  gulp.watchReload(['client/styles/**/*.less'], ['less']);
});




gulp.task('server', ['babelify', 'connect', 'watch'])

// Defalut
gulp.task('default', ['server']);
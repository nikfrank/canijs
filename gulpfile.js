var gulp = require('gulp'),
json2md = require('gulp-json2md4api'),
mocha = require('gulp-mocha'),
istanbul = require('gulp-istanbul');

var jshint = require('gulp-jshint');
 
gulp.task('lint', function() {
  return gulp.src('./cani-*/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('pre-test', function () {
  return gulp.src(['cani.js', 'cani-dynamo/cani-dynamo.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/*.js']) // clean up the tests dir
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce perfect coverage except branches, which kvetches about else statements
    // statements and lines will always fail the browser stuff. urp
    .pipe(istanbul.enforceThresholds({ thresholds: {
          statements : 95,
          branches : 70,
          lines : 95,
          functions : 100
    } }));
});



gulp.task('mocha', function () {
    return gulp.src('test/tests.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it 
        .pipe(mocha());
});

gulp.task('json2md', function (){

// grab the api.json out of all module/api dirs
    return gulp.src('cani-*/api/api.json')
	.pipe(json2md())
        .pipe(gulp.dest(''));
});


gulp.task('default', function(){
    gulp.run('json2md');
});

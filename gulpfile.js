var gulp = require('gulp'),
json2md = require('gulp-json2md4api');

gulp.task('json2md', function (){

// grab the api.json out of all module/api dirs
    return gulp.src('cani-*/api/api.json')
	.pipe(json2md())
        .pipe(gulp.dest(''));
});


gulp.task('default', function(){
    gulp.run('json2md');
});

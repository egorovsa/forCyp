var gulp = require('gulp');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');

//connect
gulp.task('connect', function () {
    connect.server({
        root: '',
        livereload: true
    });
});

//html
gulp.task('html', function () {
    gulp.src('*.html')
            .pipe(connect.reload());
});

//js
gulp.task('js', function () {
    gulp.src('src/js/*.js')
            .pipe(uglify())
            .pipe(rename({
                suffix: ".min"
            }))
            .pipe(gulp.dest('js/'))
            .pipe(connect.reload());
});


//watch
gulp.task('watch', function () {
    gulp.watch('*.html', ['html']);
    gulp.watch('src/js/*.js', ['js']);
});


gulp.task('default', ['connect', 'watch']);

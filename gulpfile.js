var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var ngmin = require('gulp-ngmin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var connect = require('gulp-connect');
var notify = require("gulp-notify");
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var embedTemplates = require('gulp-angular-embed-templates');
var templateCache = require('gulp-angular-templatecache');

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
//            .pipe(embedTemplates())
//            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(rename({
                suffix: ".min"
            }))
            //.pipe(rename('app.min.js'))
            .pipe(gulp.dest('js/'))
            //.pipe(notify('JS task is done'))
            .pipe(connect.reload());
});


//watch
gulp.task('watch', function () {
    gulp.watch('*.html', ['html']);
    gulp.watch('public/src/sass/{,*/*/}*.scss', ['sass']);
    gulp.watch('src/js/*.js', ['js']);
});


gulp.task('default', ['connect', 'watch']);

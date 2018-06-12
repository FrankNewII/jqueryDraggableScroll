var gulp = require( 'gulp' ),
    watch = require( 'gulp-watch' ),
    uglify = require( 'gulp-uglify' ),
    sass = require( 'gulp-sass' ),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect');

var gulpConfig = {
    srcJS: 'src/js/draggable-scroll.js',
    srcCSS: 'src/styles/**/*.{sass,scss}',
    distJS: 'dist/',
    dist: 'demo/'
};

gulp.task('watch', function () {
    gulp.watch(gulpConfig.srcCSS, ['styles']);
    gulp.watch(gulpConfig.srcJS, ['js']);
    connect.reload();
});

gulp.task( 'js', function () {
    gulp.src( gulpConfig.srcJS )
        .pipe( sourcemaps.init() )
        .pipe( concat( 'draggable-scroll.js' ) )
        .pipe( gulp.dest( gulpConfig.distJS ) )
        .pipe( gulp.dest( gulpConfig.dist ) )
        .pipe( uglify() )
        .pipe( sourcemaps.write())
        .pipe( rename({suffix: '.min'}))
        .pipe( gulp.dest( gulpConfig.distJS ) );
} );

gulp.task('serve', function () {
    connect.server({
        root: ['demo', 'dist'],
        livereload: true
    });
});

gulp.task('styles', function () {
    return gulp.src(gulpConfig.srcCSS)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(gulpConfig.dist))
});

gulp.task('default', [
    'styles',
    'js',
    'serve',
    'watch'
]);

var gulp = require( 'gulp' ),
    watch = require( 'gulp-watch' ),
    uglify = require( 'gulp-uglify' ),
    sass = require( 'gulp-sass' ),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    browserify = require('gulp-browserify'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect');

var gulpConfig = {
    watchJS: 'src/js/**.*js',
    srcJS: 'src/js/draggable-scroll.js',
    watchCSS: 'src/styles/**/*.{sass,scss}',
    srcCSS: 'src/styles/main.scss',
    distJS: 'dist/',
    dist: 'docs/',
    devBaseUrl: 'http://localhost'
};

gulp.task('watch', function () {
    gulp.watch(gulpConfig.watchCSS, ['styles', '_reload']);
    gulp.watch(gulpConfig.watchJS, ['js', '_reload']);
});

gulp.task( 'js', function () {
    gulp.src( gulpConfig.srcJS )
        .pipe( sourcemaps.init() )
        .pipe(browserify())
        .pipe( gulp.dest( gulpConfig.distJS ) )
        .pipe( uglify() )
        .pipe( gulp.dest( gulpConfig.dist ) )
        .pipe( sourcemaps.write())
        .pipe( rename({suffix: '.min'}))
        .pipe( gulp.dest( gulpConfig.distJS ) );
} );

gulp.task('connect', function () {
    connect.server({
        root: ['demo', 'dist'],
        base: gulpConfig.devBaseUrl,
        livereload: true
    });
});

gulp.task('styles', function () {
    return gulp.src(gulpConfig.srcCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        .pipe(gulp.dest(gulpConfig.dist))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(gulpConfig.dist))
});

gulp.task('_reload', function () {
    connect.reload();
});

gulp.task('dist', [
    'styles',
    'js'
]);

gulp.task('default', [
    'styles',
    'js',
    'connect',
    'watch'
]);

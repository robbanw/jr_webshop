var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var sass = require('gulp-sass');
var gulpFilter = require('gulp-filter');
var jeet = require("jeet");
var jeetsass = require("node-jeet-sass");
var rupture = require("rupture");
var browserSync = require('browser-sync').create();

var buildSemantic = require('./semantic/tasks/build');
var watchSemantic = require('./semantic/tasks/watch');

//Semantic UI stuff
gulp.task('build-ui', buildSemantic);

gulp.task('watch-ui', ['serve'], watchSemantic);

gulp.task('clean', function(done){
  del.sync(['dist/**', '!dist']);
  done();
});

gulp.task('styles', function(){
  var stylusFilter = gulpFilter('**/*.styl', {restore: true});
  var sassFilter = gulpFilter('**/*.sass', {restore: true});

  return gulp.src(['./src/styles/**/*.{styl,css,sass}', './semantic/dist/semantic.min.css'])
      .pipe(stylusFilter)
      .pipe(stylus({use: [jeet(), rupture()]}))
      .pipe(stylusFilter.restore)
      .pipe(sassFilter)
      .pipe(sass({includePaths: jeetsass.includePaths}))
      .pipe(sassFilter.restore)
      .pipe(gulp.dest('./dist/styles'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('themes', function(){
	return gulp.src('./semantic/dist/themes/**/*.*')
		.pipe(gulp.dest('./dist/styles/themes'));
});

gulp.task('templates', function(){
	return gulp.src('./src/**/*.jade')
		.pipe(jade())
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function(){
	return gulp.src(['./src/**/*.js', './semantic/dist/semantic.min.js'])
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('serve', ['build'], function(done){

	browserSync.init({
		server: {
			baseDir: './dist'
		}
	});

	gulp.watch(['./src/styles/**/*.{styl,css,sass}', './semantic/dist/semantic.min.css'], {interval: 1000, debounceDelay: 500,  mode: 'poll'}, ['styles']);
	gulp.watch('./src/**/*.jade', {interval: 1000, debounceDelay: 500,  mode: 'poll'}, ['templates']);
	gulp.watch(['./src/**/*.js', './semantic/dist/semantic.min.js'], {interval: 1000, debounceDelay: 500,  mode: 'poll'}, ['scripts']);
  	done();
});

gulp.task('build', function(done){
	runSequence('clean', 'styles', 'templates', 'scripts', 'themes', done);
});

gulp.task('default', ['build', 'serve', 'watch-ui']);

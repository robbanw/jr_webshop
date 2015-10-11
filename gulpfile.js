var gulp = require('gulp');
var del = require('del');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var gulpFilter = require('gulp-filter');
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

gulp.task('styles', ['clean'], function(){
  var filter = gulpFilter('**/*.styl', {restore: true});

  return gulp.src(['./src/styles/stylus/**.styl', './src/styles/css/**.css', './semantic/dist/semantic.min.css'])
      .pipe(filter)
      .pipe(stylus())
      .pipe(filter.restore)
      .pipe(gulp.dest('./dist/styles'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('themes', ['clean', 'styles'], function(){
	return gulp.src('./semantic/dist/themes/**/*.*')
		.pipe(gulp.dest('./dist/styles/themes'));
});

gulp.task('templates', ['clean'], function(){
	return gulp.src('./src/**/*.jade')
		.pipe(jade())
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', ['clean', 'templates'], function(){
	return gulp.src(['./src/**/*.js', './semantic/dist/semantic.min.js'])
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('serve', ['clean', 'build'], function(done){

	browserSync.init({
		server: {
			baseDir: './dist'
		}
	});

	gulp.watch(['./src/styles/**/*.{styl,css}', './semantic/dist/semantic.min.css'], ['styles']);
	gulp.watch('./src/**/*.jade', ['templates']);
	gulp.watch(['./src/**/*.js', './semantic/dist/semantic.min.js'], ['scripts']);
  done();
});

gulp.task('build', ['styles', 'templates', 'scripts', 'themes'])

gulp.task('default', ['build', 'serve', 'watch-ui']);

'use strict';

var gulp = require('gulp'),
	jade = require('gulp-jade'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	cssmin = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps'),
	rigger = require('gulp-rigger'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	rimraf = require('rimraf'),
	plumber = require('gulp-plumber'),
	browserSync = require("browser-sync"),
	reload = browserSync.reload,
	spritesmith  = require('gulp.spritesmith');

// Пути для всех файлов проекта
var path = {
	build: { 
		html: 'build/',
		js: './build/js/',
		css: './build/css/',
		img: './build/img/',
		spriteImg: './build/img/',
		spriteSass: './src/style/2-base/',
		fonts: './build/fonts/'
	},
	src: {
		html: './src/index.jade',
		js: './src/js/main.js',
		style: './src/style/common.sass',
		sprite: './src/img/sprite/*.*',
		img: ['./src/img/**/*.*', '!./src/img/sprite/*.*'],
		fonts: './src/fonts/**/*.*'
	},
	watch: { 
		html: './src/**/*.jade',
		js: './src/js/**/*.js',
		style: ['./src/style/**/*.sass', './src/style/**/*.scss'],
		sprite: './src/img/sprite/*.*',
		img: ['./src/img/**/*.*', '!./src/img/sprite/*.*'],
		fonts: './src/fonts/**/*.*'
	},
	clean: './build'
};

// Настройки dev сервера
var config = {
	server: {
		baseDir: "./build"
	},
	tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend_work"
};

// HTML build
gulp.task('html:build', function () {
	gulp.src(path.src.html)
	.pipe(plumber())
	.pipe(jade({
			pretty: true
		}))
	.pipe(gulp.dest(path.build.html)) 
	.pipe(reload({stream: true})); 
});

// JavaScript build
gulp.task('js:build', function () {
	gulp.src(path.src.js) 
		.pipe(plumber())
		.pipe(rigger()) 
		.pipe(sourcemaps.init()) 
		.pipe(uglify()) 
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({stream: true}));
});

// Style build
gulp.task('style:build', function () {
	gulp.src(path.src.style)
		.pipe(plumber())
		// .pipe(sourcemaps.init())
		.pipe(sass({
			indentedSyntax: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 15 version', '> 1%', 'ie 8'],
			cascade: true
		}))
		// .pipe(cssmin())
		// .pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});

// Sprite Build
gulp.task('sprite:build', function() {
	var spriteData = 
		gulp.src(path.src.sprite) // путь, откуда берем картинки для спрайта
			.pipe(plumber())
			.pipe(spritesmith({
				imgName: 'sprite.png',
				cssName: '_sprite.sass',
				cssFormat: 'sass',
				algorithm: 'binary-tree',
				cssTemplate: './src/style/2-base/sass.template.mustache',
				cssVarMap: function(sprite) {
					sprite.name = 's-' + sprite.name
				}
			}));

	spriteData.img.pipe(gulp.dest(path.build.spriteImg)); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest(path.build.spriteSass)); // путь, куда сохраняем стили
});

// Image build
gulp.task('image:build', function () {
	gulp.src(path.src.img)
		.pipe(plumber())
		.pipe(imagemin({ 
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({stream: true}));
});

// Fonts build
gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(plumber())
		.pipe(gulp.dest(path.build.fonts))
});

// Build task 
gulp.task('build', [
	'html:build',
	'js:build',
	'style:build',
	'fonts:build',
	'sprite:build',
	'image:build'
]);

// watch task
gulp.task('watch', function () {
	gulp.watch(path.watch.html, ['html:build']);
	gulp.watch(path.watch.style, ['style:build']);
	gulp.watch(path.watch.js, ['js:build']);
	gulp.watch(path.watch.img, ['image:build']);
	gulp.watch(path.watch.sprite, ['sprite:build']);
	gulp.watch(path.watch.fonts, ['fonts:build']);
});

// Webserver with livereload
gulp.task('webserver', function () {
	browserSync(config);
});

// Clean task
gulp.task('clean', function (cb) {
	rimraf(path.clean, cb);
});

// Default task
gulp.task('default', ['build', 'webserver', 'watch']);


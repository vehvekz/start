'use strict';
var gulp = require('gulp'),
	watch = require('gulp-watch'),
	batch = require('gulp-batch'),
	jade = require('gulp-jade'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	cssmin = require('gulp-minify-css'),
	sourcemaps = require('gulp-sourcemaps'),
	rigger = require('gulp-rigger'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	// clean = require('gulp-clean'),
	plumber = require('gulp-plumber'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	// svgSprite = require('gulp-svg-sprites'),
	// svgo = require('gulp-svgo'),
	// svgstore = require('gulp-svgstore'),
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
		fonts: './build/fonts/',
		svg: './build/img/svg'
	},
	src: {
		html: './src/index.jade',
		js: './src/js/main.js',
		style: './src/style/common.sass',
		sprite: './src/img/sprite/*.*',
		img: ['./src/img/**/*.*', '!./src/img/sprite/*.*'],
		fonts: './src/fonts/**/*.*',
		svg: './src/img/svg/*.svg',
		json: './src/data.json'
	},
	watch: { 
		html: './src/**/*.jade',
		js: './src/js/**/*.js',
		style: ['./src/style/**/*.sass', './src/style/**/*.scss'],
		sprite: './src/img/sprite/*.*',
		img: ['./src/img/**/*.*', '!./src/img/sprite/*.*', '!./src/img/svg/*.*'],
		fonts: './src/fonts/**/*.*',
		svg: './src/img/svg/*.svg',
		json: './src/data.json'
	},
	clean: './build'
};

// Настройки dev сервера
var config = {
	server: {
		baseDir: "./build"
	},
	tunnel: false,
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
		.pipe(sourcemaps.init())
		.pipe(sass({
			indentedSyntax: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 4 version', '> 1%', 'ie 8'],
			cascade: true
		}))
		.pipe(cssmin())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({stream: true}));
});

// Png sprite build
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
	spriteData.img.pipe(gulp.dest(path.build.spriteImg)); // путь, куда сохраняем спрайт
	spriteData.css.pipe(gulp.dest(path.build.spriteSass)); // путь, куда сохраняем стили
});

// // SVG sprite build
// gulp.task('svg:build', function () {
//     return gulp.src(path.src.svg)
//     	.pipe(svgo())
//         .pipe(svgSprite({
//         	preview: false,
//             layout: 'diagonal',
//             padding: 5,
//         	cssFile: "../../../src/style/2-base/_svg.scss",
//         	svg: {
//         		sprite: "spriteSvg.svg"
//         	}
			
//         }))
//         .pipe(gulp.dest(path.build.svg));
// });

// SVG sprite build with gulp-svgstore plugin
// gulp.task('svg:build', function () {
// 	return gulp
// 		.src(path.src.svg)
// 		.pipe(svgo())
// 		.pipe(svgstore({
// 			inlineSvg: true
// 		}))
// 		.pipe(gulp.dest(path.build.svg));
// });

// // Image build
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

// json build
// gulp.task('json:build', function() {
// 	gulp.src(path.src.json)
// 		.pipe(plumber())
// 		.pipe(gulp.dest(path.build.html))
// });

// Developer task 
gulp.task('dev', [
	'html:build',
	'js:build',
	'fonts:build',
	'image:build',
	'sprite:build',
	'style:build'
]);

// Build task 
gulp.task('build', [
	'clean',
	'html:build',
	'js:build',
	'fonts:build',
	'sprite:build',
	'image:build',
	'style:build'
]);

// watch task
gulp.task('watch', function () {
	watch(path.watch.html, batch(function (events, done) {
		gulp.start('html:build', done);
	}));
	watch(path.watch.style, batch(function (events, done) {
		gulp.start('style:build', done);
	}));
	watch(path.watch.js, batch(function (events, done) {
		gulp.start('js:build', done);
	}));
	watch(path.watch.img, batch(function (events, done) {
		gulp.start('image:build', done);
	}));
	watch(path.watch.sprite, batch(function (events, done) {
		gulp.start('sprite:build', done);
	}));
	watch(path.watch.fonts, batch(function (events, done) {
		gulp.start('fonts:build', done);
	}));
});

// gulp.task('watch', function () {
// 	watch(path.watch.html, ['html:build']);
// 	watch(path.watch.style, ['style:build']);
// 	watch(path.watch.js, ['js:build']);
// 	watch(path.watch.img, ['image:build']);
// 	watch(path.watch.sprite, ['sprite:build']);
// 	watch(path.watch.fonts, ['fonts:build']);
// 	watch(path.watch.json, ['json:build']);
// });

// Webserver with livereload
gulp.task('webserver', function () {
	browserSync(config);
});

// Clean task
// gulp.task('clean', function () {
// 	return gulp.src(path.clean, {read: false})
// 		.pipe(clean());
// });

// Default task
gulp.task('default', ['dev', 'webserver', 'watch']);


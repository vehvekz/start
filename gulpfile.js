'use strict';
var gulp = require('gulp'),
	$    = require('gulp-load-plugins')(),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	spritesmith  = require('gulp.spritesmith'),
	pngquant = require('imagemin-pngquant');

// Пути для всех файлов проекта
var path = {
	dist: { 
		html: 'dist/',
		js: './dist/assets/js/',
		css: './dist/assets/css/',
		img: './dist/assets/img/',
		spriteImg: './dist/assets/img/',
		spriteSass: './dist/style/2-base/',
		fonts: './dist/assets/fonts/',
		svg: './dist/assets/img/svg'
	},
	app: {
		html: './app/index.jade',
		js: './app/js/main.js',
		style: './app/style/common.sass',
		sprite: './app/img/sprite/*.*',
		img: ['./app/img/**/*.*', '!./app/img/sprite/*.*'],
		fonts: './app/fonts/**/*.*',
		svg: './app/img/svg/*.svg',
		json: './app/data.json'
	},
	watch: { 
		html: './app/**/*.jade',
		js: './app/js/**/*.js',
		style: ['./app/style/**/*.sass', './app/style/**/*.scss'],
		sprite: './app/img/sprite/*.*',
		img: ['./app/img/**/*.*', '!./app/img/sprite/*.*', '!./app/img/svg/*.*'],
		fonts: './app/fonts/**/*.*',
		svg: './app/img/svg/*.svg',
		json: './app/data.json'
	},
	sass: [
		'bower_components/bourbon/app/assets/stylesheets',
		'bower_components/foundation-sites/scss'
	],
	clean: './app'
};

// Настройки dev сервера
var config = {
	server: {
		baseDir: "./dist"
	},
	tunnel: false,
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend_work"
};

// HTML build
gulp.task('html:build', function () {
	gulp.src(path.app.html)
	.pipe($.plumber())
	.pipe($.jade({
			pretty: true
		}))
	.pipe(gulp.dest(path.dist.html)) 
	.pipe(reload({stream: true})); 
});

// JavaScript build
gulp.task('js:build', function () {
	gulp.src(path.app.js) 
		.pipe($.plumber())
		.pipe($.rigger()) 
		.pipe($.sourcemaps.init()) 
		.pipe($.uglify()) 
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(path.dist.js))
		.pipe(reload({stream: true}));
});

// Style build
gulp.task('style:build', function () {
	gulp.src(path.app.style)
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			indentedSyntax: true,
			includePaths: path.sass
		}))
		.pipe($.autoprefixer({
			browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'],
			cascade: true
		}))
		.pipe($.cssnano())
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(path.dist.css))
		.pipe(reload({stream: true}));
});

// Png sprite build
gulp.task('sprite:build', function() {
	var spriteData = 
		gulp.src(path.app.sprite) // путь, откуда берем картинки для спрайта
			.pipe($.plumber())
			.pipe(spritesmith({
				imgName: 'sprite.png',
				cssName: '_sprite.sass',
				cssFormat: 'sass',
				algorithm: 'binary-tree',
				cssTemplate: './app/style/2-base/sass.template.mustache',
				cssVarMap: function(sprite) {
					sprite.name = 's-' + sprite.name
				}
			}));
	spriteData.img.pipe(gulp.dest(path.dist.spriteImg)); // путь, куда сохраняем спрайт
	spriteData.css.pipe(gulp.dest(path.dist.spriteSass)); // путь, куда сохраняем стили
});

// // SVG sprite build
// gulp.task('svg:build', function () {
//     return gulp.src(path.src.svg)
//     	.pipe($.svgo())
//         .pipe($.svgSprite({
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
// 		.pipe($.svgo())
// 		.pipe($.svgstore({
// 			inlineSvg: true
// 		}))
// 		.pipe(gulp.dest(path.build.svg));
// });

// // Image build
gulp.task('image:build', function () {
	gulp.src(path.app.img)
		.pipe($.plumber())
		.pipe($.imagemin({ 
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.dist.img))
		.pipe(reload({stream: true}));
});

// Fonts build
gulp.task('fonts:build', function() {
	gulp.src(path.app.fonts)
		.pipe($.plumber())
		.pipe(gulp.dest(path.dist.fonts))
});

// json build
// gulp.task('json:build', function() {
// 	gulp.src(path.src.json)
// 		.pipe($.plumber())
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
	$.watch(path.watch.html, $.batch(function (events, done) {
		gulp.start('html:build', done);
	}));
	$.watch(path.watch.style, $.batch(function (events, done) {
		gulp.start('style:build', done);
	}));
	$.watch(path.watch.js, $.batch(function (events, done) {
		gulp.start('js:build', done);
	}));
	$.watch(path.watch.img, $.batch(function (events, done) {
		gulp.start('image:build', done);
	}));
	$.watch(path.watch.sprite, $.batch(function (events, done) {
		gulp.start('sprite:build', done);
	}));
	$.watch(path.watch.fonts, $.batch(function (events, done) {
		gulp.start('fonts:build', done);
	}));
});

// Webserver with livereload
gulp.task('webserver', function () {
	browserSync(config);
});

// Default task
gulp.task('default', ['dev', 'webserver', 'watch']);

// Clean task
// gulp.task('clean', function () {
// 	return gulp.src(path.clean, {read: false})
// 		.pipe($.clean());
// });

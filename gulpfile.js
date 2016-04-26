'use strict';

var gulp = require('gulp'),
	$ = require('gulp-load-plugins')({
		pattern : ['gulp-*', 'gulp.*', 'del'],
		rename: {
			'gulp-svg-symbols': 'svgSymbols',
			'gulp-html-prettify': 'prettify'
			}
	}),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	pngquant = require('imagemin-pngquant');

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

const path = {
	app: {
		jade: 'app/pages/*.jade',
		styles: 'app/styles/app.sass',
		scripts: 'app/scripts/app.js',
		assets: ['app/assets/**/*.*', '!app/assets/{svg,img}/**/*.*'],
		img: 'app/assets/img/**/*.*',
		svg: 'app/assets/svg/**/*.svg',
		php: 'app/**/*.php'
	},
	dist: { 
		html: 'dist',
		styles: 'dist/assets/css/',
		scripts: 'dist/assets/scripts/',
		assets: 'app/assets/',
		img: 'dist/assets/img',
		php: 'dist'
	},
	watch: { 
		html: 'app/**/*.jade',
		styles: 'app/**/*.{sass,scss}',
		scripts: 'app/scripts/**/*.js',
		assets: ['app/assets/**/*.*', '!app/assets/{svg,img}/*.*'],
		img: 'app/assets/img/**/*.*',
		svg: 'app/assets/svg/**/*.svg',
		php: 'app/**/*.php'
	},
	sass: [
		'app/libs/foundation-sites/scss',
		'app/libs/Scut/dist/'
	],
	clean: 'dist'
};

// Web server config
var config = {
	server: {
		baseDir: "./dist"
	},
	tunnel: false,
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend_work"
};

gulp.task('html', function () {
	gulp.src(path.app.jade)
	.pipe($.plumber({
		errorHandler: $.notify.onError()
	}))
	.pipe($.jade({
			brace_style: 'expand',
			indent_size: 2,
			indent_inner_html: true,
			preserve_newlines: true,
			unformatted: ['pre', 'code', 'i', 'b', 'span']
		}))
	.pipe(gulp.dest(path.dist.html)) 
	.pipe(reload({stream: true})); 
});

gulp.task('styles', function () {
	gulp.src(path.app.styles)
		.pipe($.plumber({
			errorHandler: $.notify.onError()
		}))
		.pipe($.if(isDevelopment, $.sourcemaps.init()))
		.pipe($.sass({
			indentedSyntax: true,
			includePaths: path.sass
		}))
		.pipe($.autoprefixer({
			browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']
		}))
		.pipe($.if(!isDevelopment ,$.cssnano()))
		.pipe($.if(isDevelopment, $.sourcemaps.write()))
		.pipe($.rename('app.min.css'))
		.pipe(gulp.dest(path.dist.styles))
		.pipe(reload({stream: true}));
});

gulp.task('scripts', function () {
	gulp.src(path.app.scripts) 
		.pipe($.plumber({
			errorHandler: $.notify.onError()
		}))
		.pipe($.rigger()) 
		.pipe($.if(isDevelopment, $.sourcemaps.init()))
		.pipe($.if(!isDevelopment ,$.uglify()))
		.pipe($.if(isDevelopment, $.sourcemaps.write()))
		.pipe($.rename('app.min.js'))
		.pipe(gulp.dest(path.dist.scripts))
		.pipe(reload({stream: true}));
});

gulp.task('assets', function(){
	gulp.src(path.app.assets)
		.pipe($.newer(path.dist.assets))
		.pipe($.debug({title: 'assets'}))
		.pipe(gulp.dest(path.dist.assets))
		.pipe(reload({stream: true}));
});

gulp.task('image', function () {
	gulp.src(path.app.img)
		.pipe($.plumber({
			errorHandler: $.notify.onError()
		}))
		.pipe($.imagemin({ 
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.dist.img))
		.pipe(reload({stream: true}));
});

gulp.task('svg', function(){
	gulp.src(path.app.svg)
		.pipe($.plumber({
			errorHandler: $.notify.onError()
			}))
		.pipe($.svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe($.cheerio({
			run: function ($){
				$('[fill]').removeAttr('fill');
				$('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe($.svgSymbols({
			id: 'i-%f',
			className: 'i-%f',
			templates: [
				'default-svg'
			]
		}))
		.pipe($.rename('sprite.svg'))
		.pipe(gulp.dest(path.dist.img))
		.pipe(reload({stream: true}));
});

gulp.task('php', function(){
	gulp.src(path.app.php)
		.pipe($.debug({title: 'assets'}))
		.pipe(gulp.dest(path.dist.php))
		.pipe(reload({stream: true}));
});

gulp.task('clean', function(){
	$.del('dist');
});

// Developer task 
gulp.task('dev', [
	'html',
	'scripts',
	'assets',
	'image',
	'svg',
	'styles'
]);

// watch task
gulp.task('watch', function () {
	$.watch(path.watch.html, $.batch(function (events, done) {
		gulp.start('html', done);
	}));
	$.watch(path.watch.styles, $.batch(function (events, done) {
		gulp.start('styles', done);
	}));
	$.watch(path.watch.scripts, $.batch(function (events, done) {
		gulp.start('scripts', done);
	}));
	$.watch(path.watch.assets, $.batch(function (events, done) {
		gulp.start('assets', done);
	}));
	$.watch(path.watch.img, $.batch(function (events, done) {
		gulp.start('image', done);
	}));
	$.watch(path.watch.svg, $.batch(function (events, done) {
		gulp.start('svg', done);
	}));
	$.watch(path.watch.php, $.batch(function (events, done) {
		gulp.start('php', done);
	}));
});

// Webserver
gulp.task('server', function () {
	browserSync(config);
});

// Default task
gulp.task('default', ['dev', 'server', 'watch']);


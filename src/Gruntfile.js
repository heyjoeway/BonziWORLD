module.exports = function(grunt) {

const PACKAGE = require("./package.json");

const SRC_DIR = "./"
const BUILD_DIR = "../build/"

const WWW_SRC = SRC_DIR + "www/"
const WWW_BUILD = BUILD_DIR + "www/";

const CORDOVA_SRC = SRC_DIR + "cordova/";
const CORDOVA_WWW_SRC = CORDOVA_SRC + "www_src/";
const CORDOVA_WWW = CORDOVA_SRC + "www/";

const WWW_AD = '';
const CORDOVA_AD = '';

let config = {};

config.clean = {};
config.clean.www_pre = {
	options: {
		force: true
	},
	src: [WWW_BUILD + "*"]
};
config.clean.cordova_pre = {
	options: {
		force: true
	},
	src: [CORDOVA_WWW + "*"]
};
config.clean.cordova = {
	options: {
		force: true
	},
	src: [CORDOVA_WWW + 'www/favicons/manifest.json']
};

config.sass = {};
config.sass.www = {
	files: [{
		options: {
			style: "compressed",
		},
		src: WWW_SRC + "css/style.scss",
		dest: WWW_BUILD + "css/style.min.css"
	}, {
		options: {
			style: "compressed",
		},
		src: WWW_SRC + "css/readme.scss",
		dest: WWW_BUILD + "css/readme.min.css"
	}]
};

config.htmlmin = {};
config.htmlmin.www = {
	options: {
		removeComments: true,
		collapseWhitespace: true,
		conservativeCollapse: true,
		removeEmptyAttributes: true
	},
	src: WWW_SRC + "index.html",
	dest: WWW_BUILD + "index.html"
};

config.imagemin = {};
config.imagemin.build_www = {
	files: [{
		expand: true,
		cwd: WWW_SRC + 'img/',
		src: '**/*.{png,jpg,gif}',
		dest: WWW_BUILD + "img/"
	}]
};

config.babel = {};
config.babel.options = {
	sourceMap: true,
	presets: ['babel-preset-es2015']
};
config.babel.www = {
	files: [{
		src: WWW_SRC + 'js/**/*.es2015',
		dest: WWW_SRC + "js/babel.es2015.js"
	}]
};

config.uglify = {};
config.uglify.www = {
	src: WWW_SRC + 'js/**/*.js',
	dest: WWW_BUILD + "js/script.min.js"
};

config.copy = {};
config.copy.www = {
	files: [{
		expand: true,
		cwd: WWW_SRC + 'img/',
		src: '**/*.svg',
		dest: WWW_BUILD + "img/"
	}, {
		expand: true,
		cwd: WWW_SRC + 'js_ext/',
		src: '**/*',
		dest: WWW_BUILD + "js/"
	}, {
		expand: true,
		cwd: WWW_SRC + 'favicons/',
		src: '**/*',
		dest: WWW_BUILD + "favicons/"
	}, {
		expand: true,
		cwd: WWW_SRC + 'font/',
		src: '**/*',
		dest: WWW_BUILD + "font/"
	}]
};
config.copy.test_www = {
	files: [{
		expand: true,
		cwd: WWW_SRC + 'img/',
		src: '**/*.{png,jpg,jpeg,gif}',
		dest: WWW_BUILD + "img/"
	}]
};
config.copy.cordova = {
	files: [{
		expand: true,
		cwd: WWW_BUILD,
		src: '**/*',
		dest: CORDOVA_WWW
	}, {
		expand: true,
		cwd: CORDOVA_WWW_SRC,
		src: '**/*',
		dest: CORDOVA_WWW				
	}]
};

config["string-replace"] = {};
config["string-replace"].www = {
	files: [{
		src: WWW_BUILD + "index.html",
		dest: WWW_BUILD + "index.html"
	}],
	options: {
		replacements: [{
			pattern: '{{VERSION}}',
			replacement: PACKAGE.version
		}]
	}
};
config["string-replace"].www_ad = {
	files: [{
		src: WWW_BUILD + "index.html",
		dest: WWW_BUILD + "index.html"
	}],
	options: {
		replacements: [{
			pattern: '<ad></ad>',
			replacement: WWW_AD
		}]
	}
};
config["string-replace"].cordova = {
	files: [{
		src: CORDOVA_SRC + "config.src.xml",
		dest: CORDOVA_SRC + "config.xml"
	}],
	options: {
		replacements: [{
			pattern: '{{VERSION}}',
			replacement: PACKAGE.version
		}]
	}
};
config["string-replace"].cordova_ad = {
	files: [{
		src: CORDOVA_WWW + "index.html",
		dest: CORDOVA_WWW + "index.html"
	}],
	options: {
		replacements: [{
			pattern: WWW_AD,
			replacement: CORDOVA_AD
		}]
	}
};

config.md = {};
config.md.www = {
	options: {
		wrapper: WWW_SRC + 'readme.template.html'
	},
	files: [{
		src: WWW_SRC + 'README.md',
		dest: WWW_BUILD + "readme.html"
	}]
};

grunt.initConfig(config);

require('load-grunt-tasks')(grunt);

grunt.registerTask('default', [
	"test_cordova"
]);

grunt.registerTask('www', [
	'clean:www_pre',
	'sass:www',
	'htmlmin:www',
	'babel:www',
	'uglify:www',
	'md:www',
	'copy:www',
	'string-replace:www'
]);

grunt.registerTask('test_www', [
	'www',
	'string-replace:www_ad',
	'copy:test_www'
]);

grunt.registerTask('build_www', [
	'www',
	'string-replace:www_ad',
	'imagemin:build_www'
]);


grunt.registerTask('cordova', [
	"clean:cordova_pre",
	"copy:cordova",
	"clean:cordova",
	'string-replace:cordova',
	'string-replace:cordova_ad',
]);

grunt.registerTask('test_cordova', [
	"test_www",
	"cordova"
]);

grunt.registerTask('build_cordova', [
	"build_www",
	"cordova"
]);

};
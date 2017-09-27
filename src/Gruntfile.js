module.exports = function(grunt) {

const PACKAGE = require("./package.json");

const SRC_DIR = "./"
const BUILD_DIR = "../build/"

const WWW_SRC = SRC_DIR + "www/"
const WWW_BUILD = BUILD_DIR + "www/";

const CHROME_SRC = SRC_DIR + "chrome/"
const CHROME_BUILD = BUILD_DIR + "chrome/";

const CHROME_ZIP = BUILD_DIR + "chrome.zip";

// const CCA_SRC = SRC_DIR + "cca/";
// const CCA_WWW_SRC = CCA_SRC + "www_src/";
// const CCA_WWW = CCA_SRC + "www/";

const WWW_AD = '';
const CHROME_AD = '';
// const CCA_AD = '';

grunt.initConfig({
	clean: {
		www_pre: {
			options: {
				force: true
			},
			src: [WWW_BUILD]
		},
		chrome_pre: {
			options: {
				force: true
			},
			src: [CHROME_BUILD]
		},
		chrome: {
			options: {
				force: true
			},
			src: [CHROME_BUILD + 'www/favicons/manifest.json']
		},
		// cca_pre: {
		// 	options: {
		// 		force: true
		// 	},
		// 	src: [CCA_WWW]
		// },
		// cca: {
		// 	options: {
		// 		force: true
		// 	},
		// 	src: [CCA_WWW + 'www/favicons/manifest.json']
		// },
	},
	sass: {
		www: {
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
		},
	},
	htmlmin: {
		www: {
			options: {
				removeComments: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				removeEmptyAttributes: true
			},
			src: WWW_SRC + "index.html",
			dest: WWW_BUILD + "index.html"
		}
	},
	imagemin: {
		build_www: {
			files: [{
				expand: true,
				cwd: WWW_SRC + 'img/',
				src: '**/*.{png,jpg,gif}',
				dest: WWW_BUILD + "img/"
			}]
		}
	},
    babel: {
		options: {
			sourceMap: true,
			presets: ['babel-preset-es2015']
		},
        www: {
            files: [{
				src: WWW_SRC + 'js/**/*.es2015',
				dest: WWW_SRC + "js/babel.es2015.js"
			}]
        }
    },
	uglify: {
		www: {
			src: WWW_SRC + 'js/**/*.js',
			dest: WWW_BUILD + "js/script.min.js"
		}
	},
	copy: {
		www: {
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
		},
		test_www: {
			files: [{
				expand: true,
				cwd: WWW_SRC + 'img/',
				src: '**/*.{png,jpg,jpeg,gif}',
				dest: WWW_BUILD + "img/"
			}]
		},
		chrome: {
			files: [{
				expand: true,
				cwd: WWW_BUILD,
				src: '**/*',
				dest: CHROME_BUILD + "www/"
			}, {
				expand: true,
				cwd: CHROME_SRC,
				src: '**/*',
				dest: CHROME_BUILD				
			}]
		},
		// cca: {
		// 	files: [{
		// 		expand: true,
		// 		cwd: WWW_BUILD,
		// 		src: '**/*',
		// 		dest: CCA_WWW
		// 	}, {
		// 		expand: true,
		// 		cwd: CCA_WWW_SRC,
		// 		src: '**/*',
		// 		dest: CCA_WWW				
		// 	}]
		// }
	},
	'string-replace': {
		www: {
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
		},
		www_ad: {
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
		},
		chrome: {
			files: [{
				src: CHROME_BUILD + "manifest.json",
				dest: CHROME_BUILD + "manifest.json"
			}],
			options: {
				replacements: [{
					pattern: '{{VERSION}}',
					replacement: PACKAGE.version
				}]
			}
		},
		chrome_ad: {
			files: [{
				src: CHROME_BUILD + "www/index.html",
				dest: CHROME_BUILD + "www/index.html"
			}],
			options: {
				replacements: [{
					pattern: WWW_AD,
					replacement: CHROME_AD
				}]
			}
		},
		// cca: {
		// 	files: [{
		// 		src: CCA_SRC + "config.src.xml",
		// 		dest: CCA_SRC + "config.xml"
		// 	}],
		// 	options: {
		// 		replacements: [{
		// 			pattern: '{{VERSION}}',
		// 			replacement: PACKAGE.version
		// 		}]
		// 	}
		// },
		// cca_ad: {
		// 	files: [{
		// 		src: CCA_WWW + "index.html",
		// 		dest: CCA_WWW + "index.html"
		// 	}],
		// 	options: {
		// 		replacements: [{
		// 			pattern: WWW_AD,
		// 			replacement: CCA_AD
		// 		}]
		// 	}
		// },
	},
	md: {
		www: {
			options: {
				wrapper: WWW_SRC + 'readme.template.html'
			},
			src: WWW_SRC + 'README.md',
			dest: WWW_BUILD + "readme.html"
		}
	},
	compress: {
		chrome: {
			options: {
				archive: CHROME_ZIP
			},
			files: [{
				expand: true,
				cwd: CHROME_BUILD,
				src: '**/*',
				dest: '/'
			}]
		}
	}
});

require('load-grunt-tasks')(grunt);

grunt.registerTask('default', [
	"test_www"
]);

grunt.registerTask('www', [
	// 'clean:www_pre',
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



grunt.registerTask('chrome', [
	// "clean:chrome_pre",
	"copy:chrome",
	"clean:chrome",
	'string-replace:chrome',
	'string-replace:chrome_ad',
	"compress:chrome"
]);

grunt.registerTask('test_chrome', [
	"test_www",
	"chrome"
]);

grunt.registerTask('build_chrome', [
	"build_www",
	"chrome"
]);


// grunt.registerTask('cca', [
// 	// "clean:cca_pre",
// 	"copy:cca",
// 	"clean:cca",
// 	'string-replace:cca',
// 	'string-replace:cca_ad',
// ]);

// grunt.registerTask('test_cca', [
// 	"test_www",
// 	"cca"
// ]);

// grunt.registerTask('build_cca', [
// 	"build_www",
// 	"cca"
// ]);

};
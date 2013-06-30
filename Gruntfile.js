var tests = require('./test/middleware.js');
var glob = require('glob');
var path = require('path');
var escape = require('escape-regexp');

module.exports = function(grunt) {
	var _ = grunt.util._;
	var base = '.';
	var port = 8080;
	
	tests.init(base);
	
	var testlets = glob.sync('*.html', { cwd: tests.testbase });
	
	var mobileOptions = {
		browsers: [
//			{
//				browserName: 'android',
//				platform: 'Linux',
//				version: '4',
//				deviceType: 'tablet'
//			},
			{
				browserName: 'chrome',
				platform: 'Windows 7'
			}
		],
		tunnelTimeout: 5,
		build: process.env.TRAVIS_JOB_ID,
		concurrency: 3,
		tags: [
			"master",
			"mobile"
		]
	};
	
	// Add tags for user-initiated and automated tests.
	mobileOptions.tags.push(
		process.env.SAUCE_USERNAME === "rondo"
			? "automated"
			: "user"
	);
	
	grunt.initConfig({
		
		port: port,
		
		clean: {
			build: ["build"],
			logs: ["*.log", "*.log.*"]
		},
		
		connect: {
			options: {
				hostname: '*',
				port: port,
				base: base,
				middleware: function(connect, options) {
					var middleware = testlets.map(function(filepath) {
						return tests.jasmine(
							filepath.replace(/\.html$/, ''),
							options.production
						);
					});
					
					middleware.push(connect.static(options.base));
					middleware.push(connect.directory(options.base));
					
					return middleware;
				}
			},
			
			dev: {
				options: {
					production: false
				}
			},
			
			build: {
				options: {
					production: true
				}
			}
		},
		
		'saucelabs-jasmine': {
			mobile: {
				options: _.merge(
					{
						urls: ['http://127.0.0.1:<%= port %>/test/jasmine/mobile.html'],
						testname: "mobile unit tests",
						tags: ["unit"]
					},
					mobileOptions
				)
			}
		},
		
		'saucelabs-selenium': {
			mobile: {
				options: _.merge(
					{
						url: 'http://127.0.0.1:<%= port %>/build/rondo-mobile/production/',
						script: require('./test/selenium/mobile.js'),
						local: grunt.option('local') || grunt.option('human'),
						slow: grunt.option('human'),
						autoclose: !grunt.option('human'),
						testname: "mobile integration tests",
						tags: ["integration"]
					},
					mobileOptions
				)
			}
		},
		
		watch: {
			jasmine: {
				files: [
					path.join(tests.specbase, '**/*.js')
				],
				options: {
					event: ['added', 'deleted']
				}
			}
		}
	});
	
	grunt.event.on(
		'watch',
		function(action, filepath, target) {
			tests.reload(
				filepath.match(
					new RegExp("^" + escape(tests.specbase) + "([^" + escape(path.sep) + "]+)")
				)[1]
			);
		}
	);
	
	// Loading dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key !== "grunt-cli" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	
	grunt.loadTasks('test/tasks');
	
	grunt.registerTask("dev", ["connect:dev", "watch"]);
	
	grunt.registerTask("jasmine", ["connect:build", "saucelabs-jasmine:mobile"]);
	grunt.registerTask("selenium", ["connect:build", "saucelabs-selenium:mobile"]);
	
	grunt.registerTask("test", [
		"connect:build",
		"saucelabs-jasmine:mobile",
		"saucelabs-selenium:mobile"
	]);
};

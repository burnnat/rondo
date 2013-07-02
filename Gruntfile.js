var tests = require('./test/middleware.js');
var glob = require('glob');
var path = require('path');

module.exports = function(grunt) {
	var _ = grunt.util._;
	var base = '.';
	var port = 8080;
	
	tests.init(
		base,
		{
			jasmine: {
				path: 'test/jasmine',
				page: '%s.html',
				pattern: 'spec/%s/**/*.js'
			},
			
			siesta: {
				path: 'test/siesta',
				page: '%s.html',
				pattern: 'spec/%s/**/*.t.js'
			}
		}
	);
	
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
	
	var sauceOptions = function(options) {
		return _.extend(
			{},
			mobileOptions,
			options,
			{
				tags: _.union(mobileOptions.tags, options.tags)
			}
		);
	};
	
	grunt.initConfig({
		
		port: port,
		
		clean: {
			build: [
				"archive",
				"build/**",
				"!build"
			],
			
			logs: [
				"*.log",
				"*.log.*"
			],
			
			flags: ["mobile/*.built"]
		},
		
		connect: {
			options: {
				hostname: '*',
				port: port,
				base: base,
				middleware: function(connect, options) {
					var middleware = tests.getMiddleware(options.production);
					
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
				options: sauceOptions({
					urls: ['http://127.0.0.1:<%= port %>/test/jasmine/mobile.html'],
					testname: "mobile unit tests",
					tags: ["unit"]
				})
			}
		},
		
		'saucelabs-siesta': {
			mobile: {
				options: sauceOptions({
					url: 'http://127.0.0.1:<%= port %>/test/siesta/mobile.html',
					local: grunt.option('local'),
					testname: "mobile component tests",
					tags: ["component"]
				})
			}
		},
		
		'saucelabs-selenium': {
			mobile: {
				options: sauceOptions({
					url: 'http://127.0.0.1:<%= port %>/build/rondo-mobile/production/',
					script: require('./test/selenium/mobile.js'),
					local: grunt.option('local') || grunt.option('human'),
					slow: grunt.option('human'),
					autoclose: !grunt.option('human'),
					testname: "mobile integration tests",
					tags: ["integration"]
				})
			}
		},
		
		watch: tests.getWatch(grunt)
	});
	
	// Loading dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key !== "grunt-cli" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	
	grunt.loadTasks('test/tasks');
	
	grunt.registerTask("dev", ["connect:dev", "watch"]);
	
	grunt.registerTask("jasmine", ["connect:build", "saucelabs-jasmine:mobile"]);
	grunt.registerTask("siesta", ["connect:build", "saucelabs-siesta:mobile"]);
	grunt.registerTask("selenium", ["connect:build", "saucelabs-selenium:mobile"]);
	
	grunt.registerTask("test", [
		"connect:build",
		"saucelabs-jasmine:mobile",
		"saucelabs-siesta:mobile",
		"saucelabs-selenium:mobile"
	]);
};

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
	
	grunt.initConfig({
		
		port: port,
		
		connect: {
			server: {
				options: {
					base: base,
					port: port,
					middleware: function(connect, options) {
						var middleware = testlets.map(function(filepath) {
							return tests.jasmine(filepath.replace(/\.html$/, ''));
						});
						
						middleware.push(connect.static(options.base));
						middleware.push(connect.directory(options.base));
						
						return middleware;
					}
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
						local: grunt.option('local'),
						testname: "mobile integration tests",
						tags: ["integration"]
					},
					mobileOptions
				)
			}
		},
		
		watch: {}
	});
	
	// Loading dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key !== "grunt-cli" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	
	grunt.loadTasks('test/tasks');
	
	grunt.registerTask("dev", ["connect", "watch"]);
	
	grunt.registerTask("jasmine", ["connect", "saucelabs-jasmine:mobile"]);
	grunt.registerTask("selenium", ["connect", "saucelabs-selenium:mobile"]);
	
	grunt.registerTask("test", [
		"connect",
		"saucelabs-jasmine:mobile",
		"saucelabs-selenium:mobile"
	]);
};

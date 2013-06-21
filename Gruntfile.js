var tests = require('./test/middleware.js');
var glob = require('glob');
var path = require('path');
var escape = require('escape-regexp');

module.exports = function(grunt) {
	var browsers = [
//		{
//			browserName: 'android',
//			platform: 'Linux',
//			version: '4',
//			deviceType: 'tablet'
//		},
		{
			browserName: 'chrome',
			platform: 'Windows 7'
		}
	];
	
	var base = '.';
	var port = 8888;
	
	tests.init(base);
	
	var testlets = glob.sync('*.html', { cwd: tests.testbase });
	
	grunt.initConfig({
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
			all: {
				options: {
					urls: testlets.map(function(filepath) {
						return 'http://127.0.0.1:' + port + '/'
							+ path.relative(
								base,
								path.join(
									tests.testbase,
									filepath
								)
							).replace(
								new RegExp(escape(path.sep), 'g'),
								'/'
							);
					}),
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: browsers,
					testname: "mobile unit tests",
					tags: [
						"master",
						"mobile"
					]
				}
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
	
	grunt.registerTask("dev", ["connect", "watch"]);
	grunt.registerTask("test", ["connect", "saucelabs-jasmine"]);
};

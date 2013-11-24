var fs = require('fs');
var glob = require('glob');
var path = require('path');
var properties = require('properties-parser');
var tests = require('./server/lib/tests.js');
var saucedriver = require('grunt-sauce-driver');

module.exports = function(grunt) {
	var _ = grunt.util._;
	
	/*
	 * Work around a bug in node.js where the grunt-express-server plugin
	 * calls removeAllListeners() after some listeners have already been
	 * removed, causing a fatal undefined reference error.
	 * 
	 * See: https://github.com/joyent/node/issues/6056
	 */
	process.on('exit', function() {
		process._events = _.omit(
			process._events,
			function(event) {
				return _.isUndefined(event);
			}
		);
	});
	
	var propFile = 'local.properties';
	
	var local = {
		'server.port': '8080',
		'deploy.dir': 'build/deploy'
	};
	
	if (fs.existsSync(propFile)) {
		_.extend(
			local,
			properties.read(propFile)
		);
	}
	
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
		tags: [
			"master",
			"mobile"
		]
	};
	
	// Add tags for user-initiated and automated tests.
	mobileOptions.tags.push(
		mobileOptions.username === "rondo"
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
		
		domain: local['app.domain'] || 'http://localhost:<%= port %>',
		port: parseInt(local['server.port']),
		deployTarget: local['deploy.dir'],
		
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
			
			flags: ["mobile/*.built"],
			
			deploy: {
				src: [
					'<%= deployTarget %>/**',
					'!<%= deployTarget %>',
					'!<%= deployTarget %>/.git/**',
					'!<%= deployTarget %>/archive/**',
					'!<%= deployTarget %>/.env',
					'!<%= deployTarget %>/.gitignore',
					'!<%= deployTarget %>/.project',
					'!<%= deployTarget %>/Procfile'
				],
				options: {
					force: true
				}
			},
			
			postdeploy: {
				src: ['<%= deployTarget %>/node_modules/rondo/**'],
				options: {
					force: true
				}
			}
		},
		
		express: {
			options: {
				script: './server/web.js',
				port: '<%= port %>'
			},
			
			dev: {
				options: {
					node_env: 'development'
				}
			},
			
			build: {
				options: {
					node_env: 'staging'
				}
			}
		},
		
		mochaTest: {
			options: {
				reporter: 'spec'
			},
			
			server: {
				src: ['test/mocha/**/*.js']
			}
		},
		
		saucedriver: {
			options: {
				username: local['sauce.user'] || process.env.SAUCE_USERNAME,
				key: local['sauce.key'] || process.env.SAUCE_ACCESS_KEY,
				tunneled: local['sauce.tunnel'] !== 'false',
				tunnelTimeout: 5,
				build: process.env.TRAVIS_JOB_ID,
				local: grunt.option('local'),
				concurrency: 3
			},
			
			"jasmine-mobile": {
				options: sauceOptions({
					url: '<%= domain %>/test/jasmine/mobile.html',
					script: saucedriver.jasmine,
					testname: "mobile unit tests",
					tags: ["unit"]
				})
			},
			
			"siesta-mobile": {
				options: sauceOptions({
					url: '<%= domain %>/test/siesta/mobile.html',
					script: saucedriver.siesta,
					local: grunt.option('local'),
					testname: "mobile component tests",
					tags: ["component"]
				})
			},
			
			"selenium-mobile": {
				options: sauceOptions({
					url: '<%= domain %>/mobile/',
					script: require('./test/selenium/mobile.js')
						.init(
							local['facebook.user.email'] || process.env.FACEBOOK_USERNAME,
							local['facebook.user.password'] || process.env.FACEBOOK_PASSWORD
						),
					local: grunt.option('local') || grunt.option('human'),
					slow: grunt.option('human'),
					autoclose: !grunt.option('human'),
					testname: "mobile integration tests",
					tags: ["integration"]
				})
			}
		},
		
		watch: tests.getWatch(grunt),
		
		copy: {
			mobile: {
				expand: true,
				cwd: 'build/rondo-mobile/production/',
				src: '**',
				dest: '<%= deployTarget %>/build/mobile/'
			},
			
			desktop: {
				expand: true,
				cwd: 'build/rondo-desktop/production/',
				src: '**',
				dest: '<%= deployTarget %>/build/desktop/'
			},
			
			prepublish: {
				src: 'node_modules/grunt-sauce-driver/reporters/siesta.js',
				dest: 'test/siesta/reporter.js'
			},
			
			deploy: {
				expand: true,
				cwd: '<%= deployTarget %>/node_modules/rondo/',
				src: '**',
				dest: '<%= deployTarget %>'
			},
			
			prebuild: {
				expand: true,
				cwd: '<%= deployTarget %>',
				src: 'archive/**',
				dest: path.relative(local['deploy.dir'], '.')
			},
			
			postbuild: {
				expand: true,
				cwd: 'archive',
				src: '**',
				dest: '<%= deployTarget %>/archive'
			}
		},
		
		bgShell: {
			build: {
				cmd: 'ant'
			},
			
			deploy: {
				cmd: 'npm install "' + path.relative(local['deploy.dir'], '.') + '"',
				execOpts: {
					cwd: '<%= deployTarget %>'
				}
			},
			
			mongo: {
				cmd: 'mongod',
				bg: true,
				stdout: false,
				stderr: false
			},
			
			mongoStop: {
				cmd: 'mongo --eval "db.getSiblingDB(\'admin\').shutdownServer()"',
				stdout: false,
				stderr: false
			}
		}
	});
	
	// Loading dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key !== "grunt-cli" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	
	grunt.registerTask("dev", ["bgShell:mongo", "express:dev", "watch"]);
	grunt.registerTask("staging", ["bgShell:mongo", "express:build", "watch"]);
	
	grunt.registerTask("mocha", ["bgShell:mongo", "express:build", "mochaTest:server", "bgShell:mongoStop"]);
	grunt.registerTask("jasmine", ["express:build", "saucedriver:jasmine-mobile"]);
	grunt.registerTask("siesta", ["express:build", "saucedriver:siesta-mobile"]);
	grunt.registerTask("selenium", ["express:build", "saucedriver:selenium-mobile"]);
	
	grunt.registerTask("test", [
		"express:build",
		"mochaTest:server",
		"saucedriver:jasmine-mobile",
//		"saucedriver:siesta-mobile",
		"saucedriver:selenium-mobile"
	]);
	
	grunt.registerTask("deploy", [
		"clean:build",
		"clean:deploy",
		
		"bgShell:deploy",
		"copy:deploy",
		"clean:postdeploy",
		
		"copy:prebuild",
		"bgShell:build",
		"copy:postbuild",
		
		"copy:mobile",
		"copy:desktop"
	]);
};

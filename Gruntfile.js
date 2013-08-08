var glob = require('glob');
var path = require('path');
var tests = require('./server/lib/tests.js');

module.exports = function(grunt) {
	var _ = grunt.util._;
	var base = '.';
	var port = 8080;
	
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
	
	var deployTarget = grunt.option('target') || 'build/deploy';
	
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
			
			flags: ["mobile/*.built"],
			
			deploy: {
				src: [
					path.join(deployTarget, '**'),
					'!' + deployTarget,
					'!' + path.join(deployTarget, '.git/**'),
					'!' + path.join(deployTarget, '.gitignore'),
					'!' + path.join(deployTarget, '.project'),
					'!' + path.join(deployTarget, 'Procfile')
				],
				options: {
					force: true
				}
			},
			
			postdeploy: {
				src: [
					path.join(deployTarget, 'node_modules/rondo/**')
				],
				options: {
					force: true
				}
			}
		},
		
		express: {
			options: {
				script: './server/web.js',
				port: port
			},
			
			dev: {
				node_env: 'development'
			},
			
			build: {
				node_env: 'production'
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
		
		watch: tests.getWatch(grunt),
		
		copy: {
			mobile: {
				expand: true,
				cwd: 'build/rondo-mobile/production/',
				src: '**',
				dest: path.join(deployTarget, 'build/mobile/')
			},
			
			desktop: {
				expand: true,
				cwd: 'build/rondo-desktop/production/',
				src: '**',
				dest: path.join(deployTarget, 'build/desktop/')
			},
			
			deploy: {
				expand: true,
				cwd: path.join(deployTarget, 'node_modules/rondo/'),
				src: '**',
				dest: deployTarget
			}
		},
		
		exec: {
			build: {
				command: 'ant'
			},
			deploy: {
				cwd: deployTarget,
				command: 'npm install ' + path.relative(deployTarget, '.')
			}
		}
	});
	
	// Loading dependencies
	for (var key in grunt.file.readJSON("package.json").devDependencies) {
		if (key !== "grunt" && key !== "grunt-cli" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	
	grunt.loadTasks('./server/tasks');
	
	grunt.registerTask("dev", ["express:dev", "watch"]);
	
	grunt.registerTask("jasmine", ["connect:build", "saucelabs-jasmine:mobile"]);
	grunt.registerTask("siesta", ["connect:build", "saucelabs-siesta:mobile"]);
	grunt.registerTask("selenium", ["connect:build", "saucelabs-selenium:mobile"]);
	
	grunt.registerTask("test", [
		"express:build",
		"saucelabs-jasmine:mobile",
		"saucelabs-siesta:mobile",
		"saucelabs-selenium:mobile"
	]);
	
	grunt.registerTask("deploy", [
		"clean:deploy",
		"exec:deploy",
		"copy:deploy",
		"clean:postdeploy",
//		"exec:build",
		"copy:mobile",
		"copy:desktop"
	]);
};

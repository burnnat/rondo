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
	
	grunt.initConfig({
		connect: {
			server: {
				options: {
					base: "",
					port: 8888
				}
			}
		},
		
		'saucelabs-jasmine': {
			all: {
				options: {
					urls: ["http://127.0.0.1:8888/test/jasmine/MobileSpec.html"],
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
		if (key !== "grunt" && key.indexOf("grunt") === 0) {
			grunt.loadNpmTasks(key);
		}
	}
	
	grunt.registerTask("dev", ["connect", "watch"]);
	grunt.registerTask("test", ["connect", "saucelabs-jasmine"]);
};

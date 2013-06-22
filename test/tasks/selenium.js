var webdriver = require('wd');
var SauceTunnel = require('sauce-tunnel');
var spawn = require('child_process').spawn;

module.exports = function(grunt) {
	
	var run = function(driverConfig, options, callback) {
		
		var queue = grunt.util.async.queue(
			function(browserConfig, browserCallback) {
				var browser = webdriver.remote(driverConfig);
				
				browser.on('status', function(info){
					grunt.log.writeln('\x1b[36m%s\x1b[0m', info);
				});
				
				browser.on('command', function(method, path){
					grunt.log.writeln(' > \x1b[33m%s\x1b[0m: %s', method, path);
				});
				
				var scriptCallback = function(err) {
					if (err) {
						grunt.log.error('Script ended with error: ' + err);
					}
					else {
						grunt.log.ok('Script run completed.');
					}
					
					browserCallback(err);
				};
				
				var chain = browser.chain({ onError: scriptCallback });
				
				chain.init(
						browserConfig,
						function(err) {
							if (err) {
								if (err) {
									grunt.log.error('Unable to initialize browser: ' + err);
								}
								
								browserCallback(err);
							}
							else {
								chain.get(options.url);
								options.script(chain);
								chain.quit(scriptCallback);
							}
						}
					);
			},
			options.concurrency
		);
		
		var failures;
		
		options.browsers.forEach(function(browserConfig) {
			var browserId = [browserConfig.browserName, browserConfig.version, browserConfig.platform].join(':');
			
			browserConfig.name = options.testname;
			browserConfig.tags = options.tags;
			
			var tunnelId = options['tunnel-identifier'];
			
			if (tunnelId) {
				browserConfig['tunnel-identifier'] = tunnelId;
			}
			
			queue.push(
				browserConfig,
				function(err) {
					if (err) {
						failures = failures || {};
						failures[browserId] = err;
					}
				}
			);
		});
		
		queue.drain = function() {
			if (failures) {
				grunt.log.error('One or more tests failed.');
			}
			
			callback(failures);
		};
	};
	
	grunt.registerMultiTask(
		'saucelabs-selenium',
		'Run Selenium tests on SauceLabs via NodeJS WebDriver bindings',
		function() {
			var options = this.options({
				username: process.env.SAUCE_USERNAME,
				key: process.env.SAUCE_ACCESS_KEY,
				identifier: Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
				concurrency: 1,
				tunnelTimeout: 120,
				testname: "",
				tags: []
			});
			
			if (!options.script) {
				grunt.log.error('No Selenium script specified.');
				return false;
			}
			
			var done = this.async();
			
			if (!options.local) {
				var tunnel = new SauceTunnel(
					options.username,
					options.key,
					options.identifier,
					true,
					options.tunnelTimeout
				);
				
				var methods = ['write', 'writeln', 'error', 'ok', 'debug'];
				methods.forEach(function (method) {
					tunnel.on('log:' + method, function (text) {
						grunt.log[method](text);
					});
					
					tunnel.on('verbose:' + method, function (text) {
						grunt.verbose[method](text);
					});
				});
				
				grunt.log.writeln("=> Connecting to Saucelabs ...");
				
				tunnel.start(function(created) {
					if (!created) {
						grunt.log.error('Failed to create SauceConnect tunnel.');
						done(false);
					}
					
					grunt.log.ok("Connected to Saucelabs.");
					
					options['tunnel-identifier'] = tunnel.identifier;
					
					run(
						{
							host: 'ondemand.saucelabs.com',
							port: 80,
							username: options.username,
							accessKey: options.key
						},
						options,
						function(err) {
							tunnel.stop(function() {
								grunt.log.writeln('Tunnel connection closed.');
								done(err);
							});
						}
					);
				})
			}
			else {
				grunt.log.writeln("=> Starting local WebDriver ...");
				
				var scriptErr;
				var driverPort = options.driverPort || 9515;
				
				var driver = spawn(
					'C:/Selenium/chromedriver.exe',
					['--port=' + driverPort]
				);
				
				driver.stderr.on('data', function(data) {
					grunt.log.verbose.write(data);
				});
				
				driver.on('close', function(code) {
					if (code) {
						grunt.log.error('Local WebDriver terminated with error: ' + code);
					}
					else {
						grunt.log.writeln('Local WebDriver terminated.');
					}
					
					done(scriptErr);
				});
				
				run(
					{
						host: '127.0.0.1',
						port: driverPort,
						path: '/'
					},
					options,
					function(err) {
						scriptErr = err;
						driver.kill();
					}
				);
			}
		}
	);
}

var webdriver = require('wd');
var SauceLabs = require('saucelabs');
var SauceTunnel = require('sauce-tunnel');
var spawn = require('child_process').spawn;

module.exports = function(grunt) {
	
	var _ = grunt.util._;
	
	var run = function(driverConfig, options, callback) {
		
		var logError = function(message, error) {
			var message = message + ': ' + error.message;
			
			if (error.data) {
				var data = JSON.parse(error.data);
				
				if (data.value && data.value.message) {
					message = message + ' [ ' + data.value.message + ' ]';
				}
			}
			
			grunt.log.error(message);
		};
		
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
						logError('Script ended with error', err);
					}
					else {
						grunt.log.ok('Script run completed.');
					}
					
					browserCallback(err, browser);
				};
				
				var chain = browser.chain({
					onError: options.autoclose
						? function(err) {
							browser.quit(function() {
								scriptCallback(err);
							});
						}
						: scriptCallback
				});
				
				_.each(
					_.functions(chain),
					function(name) {
						var original = chain[name];
						
						chain[name] = function() {
							var args = 
								_.reduce(
									arguments,
									function(args, arg) {
										if (_.isFunction(arg)) {
											args.push(function() {
												try {
													arg.apply(this, arguments);
													
													if (options.slow) {
														browser.next('pauseChain', 500);
													}
												}
												catch(e) {
													browser.next('haltChain');
													browser._chainOnErrorCallback(e);
												}
											});
										}
										else {
											args.push(arg);
										}
										
										return args;
									},
									[]
								);
							
							return original.apply(this, args);
						};
					}
				);
				
				chain.init(
					browserConfig,
					function(err) {
						if (err) {
							if (err) {
								logError('Unable to initialize browser', err);
							}
							
							browserCallback(err);
						}
						else {
							chain.get(options.url);
							options.script(browser, chain);
							
							chain[options.autoclose ? 'quit' : 'status'](scriptCallback);
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
			browserConfig.build = options.build;
			
			var tunnelId = options['tunnel-identifier'];
			
			if (tunnelId) {
				browserConfig['tunnel-identifier'] = tunnelId;
			}
			
			var afterBrowser = browserConfig.callback || options.callback;
			
			queue.push(
				browserConfig,
				function(err, browser) {
					if (err) {
						failures = failures || {};
						failures[browserId] = err;
					}
					
					if (afterBrowser) {
						afterBrowser(err, browser);
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
				tags: [],
				autoclose: true,
				slow: false
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
					
					var sauce = new SauceLabs({
						username: options.username,
						password: options.key
					});
					
					// Update SauceLabs job status as browser run completes.
					options.callback = function(err, browser) {
						var job = browser.sessionID;
						
						sauce.updateJob(
							job,
							{ passed: !err },
							function(err) {
								if (err) {
									grunt.log.error('Error updating SauceLabs status for job ' + job + ': ' + err);
								}
								else {
									grunt.log.verbose.writeln('Updated SauceLabs status for job: ' + job);
								}
							}
						);
					};
					
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
								done(!err);
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
					grunt.log.verbose.writeln(data);
				});
				
				driver.on('close', function(code) {
					if (code) {
						grunt.log.error('Local WebDriver terminated with error: ' + code);
					}
					else {
						grunt.log.writeln('Local WebDriver terminated.');
					}
					
					done(!scriptErr);
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

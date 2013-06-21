var webdriver = require('wd');
var script = require('./mobile.js');

var remote = true;

var options = {
	browserName: 'chrome',
	version: '27',
	platform: 'Windows 7',
	tags: ['master', 'mobile'],
	name: 'mobile integration tests'
};

var createBrowser = function(config) {
	var browser = webdriver.remote(config);
	
	browser.on('status', function(info){
		console.log('\x1b[36m%s\x1b[0m', info);
	});
	
	browser.on('command', function(meth, path){
		console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
	});
	
	return browser;
}

if (remote) {
	var SauceTunnel = require('sauce-tunnel');
	
	var tunnel = new SauceTunnel(
		process.env.SAUCE_USERNAME,
		process.env.SAUCE_ACCESS_KEY,
		Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
		true,
		30
	);
	
	var methods = ['write', 'writeln', 'error', 'ok', 'debug'];
	methods.forEach(function (method) {
		tunnel.on('log:' + method, function (text) {
			console.log(text);
		});
		
//		tunnel.on('verbose:' + method, function (text) {
//			grunt.verbose[method](text);
//		});
	});
	
	console.log("=> Connecting to Saucelabs ...");
	
	tunnel.start(function(created) {
		if (!created) {
			console.err('Failed to create SauceConnect tunnel.');
			process.exit();
		}
		
		console.log("Connected to Saucelabs.");
		
		var browser = createBrowser({
			host: 'ondemand.saucelabs.com',
			port: 80
		});
		
		options['tunnel-identifier'] = tunnel.identifier;
		
		script(
			browser,
			options,
			function(err) {
				if (err) {
					console.error('Script ended with error: ' + err);
				}
				
				tunnel.stop(function() {
					console.log('Script run completed.');
				});
			}
		);
	})
}
else {
	script(
		createBrowser({
			host: '127.0.0.1',
			port: 9515,
			path: '/'
		}),
		options
	);
}
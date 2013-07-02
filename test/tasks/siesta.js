var runner = require('./lib/runner.js');

var siesta = function(browser, chain) {
	var runButton = '.x-btn a[data-qtip="Run all"]';
	var expandButton = '.x-region-collapsed-right-placeholder .x-tool-expand-left';
	var complete = '.tr-testgrid .tr-status-bugs-small, .tr-testgrid .tr-status-allgreen-small';
	
	chain
		.waitForElementByCss(runButton, 10000)
		.elementByCss(expandButton, function(err, el) {
			browser.next('moveTo', el);
			browser.next('clickElement', el);
		})
		.elementByCss(runButton, function(err, el) {
			browser.next('moveTo', el);
			browser.next('clickElement', el);
		})
		.elementByCss('.tr-siesta-logo', function(err, el) {
			browser.next('moveTo', el);
		})
		.waitForElementByCss(complete, 180000)
		.safeEval("Siesta.REPORTER ? Siesta.my.activeHarness.generateReport() : null", function(err, obj) {
			if (obj) {
				browser.saucePassed = obj.passed;
				browser.sauceData = { siesta: obj };
			}
		});
}

module.exports = function(grunt) {
	grunt.registerMultiTask(
		'saucelabs-siesta',
		'Run Siesta tests using SauceLabs browsers',
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
				slow: false,
				logging: false
			});
			
			options.script = siesta;
			
			runner.run(grunt, options, this.async());
		}
	);
}

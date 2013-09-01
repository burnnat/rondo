var runner = require('../lib/sauce-runner.js');

var siesta = function(browser, chain) {
	var runButton = '.x-btn a[title="Run all"]';
	
	chain
		.waitForElementByCss(runButton, 10000)
		.elementByCss(runButton, function(err, el) {
			browser.next('moveTo', el);
			browser.next('clickElement', el);
		})
		.elementByCss('a.logo-link', function(err, el) {
			browser.next('moveTo', el);
		})
		.waitForCondition('!!Siesta.my.activeHarness.endDate', 180000, 1000)
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
				tunneled: true,
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

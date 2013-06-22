var assert = require('assert');
var xpath = require('./xpath.js');

module.exports = function(browser) {
	var clickEl = function(err, el) {
		browser.next('clickElement', el);
	};
	
	var sketchTitle = 'Test Sketch';
	
	browser
		.title(function(err, title) {
			assert.ok(title, 'Rondo', 'Incorrect title');
		})
		.waitForElementByXPath(xpath.title('Login'), 30000)
		.elementByXPath(xpath.buttonText('cancel'), clickEl)
		.elementByXPath(xpath.buttonIcon('add'), clickEl)
		.elementByXPath(xpath.textField('Title'), function(err, el) {
			browser.next('type', el, sketchTitle);
		})
		.elementByXPath(xpath.buttonText('Create'), clickEl)
		.elementByXPath(xpath.listItem(sketchTitle), clickEl);
}
var assert = require('assert');
var xpath = require('./xpath.js');

module.exports = function(browser, chain) {
	var clickEl = function(description) {
		return function(err, el) {
			assert.ok(el, 'Element not found: ' + description);
			browser.next('clickElement', el);
		};
	};
	
	var sketchTitle = 'Test Sketch';
	
	chain
		.title(function(err, title) {
			assert.equal(title, 'Rondo', 'Incorrect title');
		})
		.waitForElementByXPath(xpath.title('Login'), 60000)
		.elementByXPath(xpath.buttonText('cancel'), clickEl('cancel button'))
		.elementByXPath(xpath.buttonIcon('add'), clickEl('add sketch button'))
		.elementByXPath(xpath.textField('Title'), function(err, el) {
			browser.next('type', el, sketchTitle);
		})
		.elementByXPath(xpath.buttonText('Create'), clickEl('create button'))
		.elementByXPath(xpath.listItem(sketchTitle), clickEl('sketch list entry'));
}
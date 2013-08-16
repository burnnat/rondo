var assert = require('assert');
var xpath = require('./xpath.js');

module.exports = function(browser, chain) {
	chain.log = function(message) {
		this.queueAddAsync(function(next) {
			browser.emit('log', message);
			next();
		});
		
		return this;
	};
	
	var clickEl = function(description) {
		return function(err, el) {
			assert.ok(el, 'Element not found: ' + description);
			browser.next('clickElement', el);
		};
	};
	
	var sketchTitle = 'Test Sketch';
	var timeout = 2500;
	
	chain
		.title(function(err, title) {
			assert.equal(title, 'Rondo', 'Incorrect title');
		})
		
		.log('Open login pane, click Cancel')
		
		.waitForElementByXPath(xpath.buttonText('Login'), 60000)
		.elementByXPath(xpath.buttonText('Login'), clickEl('login button'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.elementByXPath(xpath.buttonText('Cancel'), clickEl('cancel button'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.log('Create sketch')
		
		.elementByXPath(xpath.buttonIcon('add'), clickEl('add sketch button'))
		
		.elementByXPath(xpath.textField('Title'), function(err, el) {
			browser.next('type', el, sketchTitle);
		})
		.elementByXPath(xpath.buttonText('Create'), clickEl('create button'))
		
		.log('Open sketch')
		
		.elementByXPath(xpath.listItem(sketchTitle), clickEl('sketch list entry'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.log('Close sketch')
		
		.elementByXPath(xpath.buttonText('Back'), clickEl('back button'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.log('Open login pane, select Google')
		
		.elementByXPath(xpath.buttonText('Login'), clickEl('login button'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.elementByCss('button.google', clickEl('Google sign-in button'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.log('Re-open sketch')
		
		.elementByXPath(xpath.listItem(sketchTitle), clickEl('sketch list entry'))
		.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
		
		.log('Logout')
		
		.elementByXPath(xpath.buttonText('Logout'), clickEl('logout button'))
		.elementByXPath(xpath.buttonText('Login'));
}
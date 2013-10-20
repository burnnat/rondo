var assert = require('assert');
var url = require('url');
var xpath = require('./xpath.js');

module.exports = {
	init: function(username, password) {
		return function(browser) {
			if (!username) {
				return 'No username supplied';
			}
			
			if (!password) {
				return 'No password supplied';
			}
			
			var log = function(message) {
				return function() {
					browser.emit('log', message);
				};
			};
			
			var clickEl = function(description) {
				return function(el) {
					assert.ok(el, 'Element not found: ' + description);
					return browser.clickElement(el);
				};
			};
			
			var typeEl = function(text, description) {
				return function(el) {
					assert.ok(el, 'Element not found: ' + description);
					return browser.type(el, text);
				}
			}
			
			var sketchTitle = 'Test Sketch';
			var pageTimeout = 60000;
			var timeout = 2500;
			
			return (
				browser
				.title()
				.then(function(title) {
					assert.equal(title, 'Rondo', 'Incorrect title');
				})
				
				.then(log('Open login pane, click Cancel'))
				.waitForElementByXPath(xpath.buttonText('Login'), pageTimeout)
				
				.elementByXPath(xpath.buttonText('Login'))
				.then(clickEl('login button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.elementByXPath(xpath.buttonText('Cancel'))
				.then(clickEl('cancel button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.then(log('Create sketch'))
				
				.elementByXPath(xpath.buttonIcon('add'))
				.then(clickEl('add sketch button'))
				
				.elementByXPath(xpath.textField('Title'))
				.then(typeEl(sketchTitle, 'title textfield'))
				
				.elementByXPath(xpath.buttonText('Create'))
				.then(clickEl('create button'))
				
				.then(log('Open sketch'))
				
				.elementByXPath(xpath.listItem(sketchTitle))
				.then(clickEl('sketch list entry'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.then(log('Close sketch'))
				
				.elementByXPath(xpath.buttonText('Back'))
				.then(clickEl('back button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.then(log('Open login pane, select Facebook'))
				
				.elementByXPath(xpath.buttonText('Login'))
				.then(clickEl('login button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.elementByCss('button.facebook')
				.then(clickEl('Facebook sign-in button'))
				.waitForElementByCss('#login_form', pageTimeout)
				
				.then(log('Login to Facebook'))
				
				.url()
				.then(function(loc) {
					assert.equal(url.parse(loc).hostname, 'www.facebook.com', 'Did not redirect to Facebook');
				})
				
				.elementByCss('#email')
				.then(typeEl(username, 'email field'))
				
				.elementByCss('#pass')
				.then(typeEl(password, 'password field'))
				
				.elementByCss('input[type=submit]')
				.then(clickEl('submit button'))
				
				.waitForElementByXPath(xpath.buttonText('Logout'), pageTimeout)
				
				.then(log('Re-open sketch'))
				
				.elementByXPath(xpath.listItem(sketchTitle))
				.then(clickEl('sketch list entry'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.then(log('Logout'))
				
				.elementByXPath(xpath.buttonText('Logout'))
				.then(clickEl('logout button'))
				.waitForElementByXPath(xpath.buttonText('Login'), timeout)
			);
		};
	}
}
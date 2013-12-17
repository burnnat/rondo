var assert = require('assert');
var url = require('url');
var xpath = require('./xpath.js');

module.exports = {
	init: function(username, password) {
		return function(browser, options) {
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
			};
			
			var waitForAnimation = function() {
				return browser.waitForCondition('Ext.AnimationQueue.isIdle', 2500);
			};
			
			var openMenu = function() {
				return browser.elementByXPath(xpath.buttonIcon('list'))
					.then(clickEl('side menu'))
					.then(waitForAnimation);
			};
			
			var sketchTitle = 'Test Sketch';
			
			return (
				browser
				.title()
				.then(function(title) {
					assert.equal(title, 'Rondo', 'Incorrect title');
				})
				
				.then(log('Open login pane, click Cancel'))
				.waitForElementByXPath(xpath.buttonIcon('list'), options.testReadyTimeout)
				.then(openMenu)
				
				.elementByXPath(xpath.buttonText('Login'))
				.then(clickEl('login button'))
				.then(waitForAnimation)
				
				.elementByXPath(xpath.buttonText('Cancel'))
				.then(clickEl('cancel button'))
				.then(waitForAnimation)
				
				.then(log('Create sketch'))
				
				.elementByXPath(xpath.buttonIcon('add'))
				.then(clickEl('add sketch button'))
				
				.elementByXPath(xpath.textField('Title'))
				.then(typeEl(sketchTitle, 'title textfield'))
				
				.elementByXPath(xpath.buttonText('Create'))
				.then(clickEl('create button'))
				
				.then(log('Open sketch'))
				
				.waitForElementByXPath(xpath.listItem(sketchTitle))
				.elementByXPath(xpath.listItem(sketchTitle))
				.then(clickEl('sketch list entry'))
				.then(waitForAnimation)
				
				.then(log('Close sketch'))
				
				.elementByXPath(xpath.buttonText('Back'))
				.then(clickEl('back button'))
				.then(waitForAnimation)
				
				.then(log('Open login pane, select Facebook'))
				
				.then(openMenu)
				.elementByXPath(xpath.buttonText('Login'))
				.then(clickEl('login button'))
				.then(waitForAnimation)
				
				.elementByCss('button.facebook')
				.then(clickEl('Facebook sign-in button'))
				.waitForElementByCss('#login_form', options.testReadyTimeout)
				
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
				
				.waitForElementByXPath(xpath.buttonIcon('list'), options.testReadyTimeout)
				
				.then(log('Re-open sketch'))
				
				.elementByXPath(xpath.listItem(sketchTitle))
				.then(clickEl('sketch list entry'))
				.then(waitForAnimation)
				
				.then(log('Logout'))
				
				.then(openMenu)
				.elementByXPath(xpath.buttonText('Logout'))
				.then(clickEl('logout button'))
				.waitForElementByXPath(xpath.buttonText('Login'))
			);
		};
	}
}
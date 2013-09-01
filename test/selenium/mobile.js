var assert = require('assert');
var url = require('url');
var xpath = require('./xpath.js');

module.exports = {
	init: function(username, password) {
		return function(browser, chain) {
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
			
			var typeEl = function(text, description) {
				return function(err, el) {
					assert.ok(el, 'Element not found: ' + description);
					browser.next('type', el, text);
				}
			}
			
			var sketchTitle = 'Test Sketch';
			var pageTimeout = 60000;
			var timeout = 2500;
			
			chain
				.title(function(err, title) {
					assert.equal(title, 'Rondo', 'Incorrect title');
				})
				
				.log('Open login pane, click Cancel')
				
				.waitForElementByXPath(xpath.buttonText('Login'), pageTimeout)
				.elementByXPath(xpath.buttonText('Login'), clickEl('login button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.elementByXPath(xpath.buttonText('Cancel'), clickEl('cancel button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.log('Create sketch')
				
				.elementByXPath(xpath.buttonIcon('add'), clickEl('add sketch button'))
				
				.elementByXPath(xpath.textField('Title'), typeEl(sketchTitle, 'title textfield'))
				.elementByXPath(xpath.buttonText('Create'), clickEl('create button'))
				
				.log('Open sketch')
				
				.elementByXPath(xpath.listItem(sketchTitle), clickEl('sketch list entry'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.log('Close sketch')
				
				.elementByXPath(xpath.buttonText('Back'), clickEl('back button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.log('Open login pane, select Facebook')
				
				.elementByXPath(xpath.buttonText('Login'), clickEl('login button'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.elementByCss('button.facebook', clickEl('Facebook sign-in button'))
				.waitForElementByCss('#login_form', pageTimeout)
				
				.log('Login to Facebook')
				
				.url(function(err, loc) {
					assert.equal(url.parse(loc).hostname, 'www.facebook.com', 'Did not redirect to Facebook');
				})
				
				.elementByCss('#email', typeEl(username, 'email field'))
				.elementByCss('#pass', typeEl(password, 'password field'))
				.elementByCss('input[type=submit]', clickEl('submit button'))
				
				.waitForElementByXPath(xpath.buttonText('Logout'), pageTimeout)
				
				.log('Re-open sketch')
				
				.elementByXPath(xpath.listItem(sketchTitle), clickEl('sketch list entry'))
				.waitForCondition('Ext.AnimationQueue.isIdle', timeout)
				
				.log('Logout')
				
				.elementByXPath(xpath.buttonText('Logout'), clickEl('logout button'))
				.elementByXPath(xpath.buttonText('Login'));
		};
	}
}
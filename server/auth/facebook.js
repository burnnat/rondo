var querystring = require('querystring');
var passport = require("passport");
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = {
	name: 'facebook',
	
	init: function(options) {
		var name = this.name;
		var callback = options.appDomain + '/auth/' + name + '/return';
		var immediateCallback = callback + '?immediate=true&returnHash=true';
		
		if (!options.facebookID && !options.facebookSecret) {
			return null;
		}
		
		return {
			name: name,
			
			strategy: FacebookStrategy,
			strategyConfig: {
				clientID: options.facebookID,
				clientSecret: options.facebookSecret,
				callbackURL: callback
			},
			
			getIdentifier: function(accessToken, refreshToken, profile) {
				return profile.id;
			},
			
			getProfile: function(accessToken, refreshToken, profile) {
				return {
					name: profile.displayName
				};
			},
			
			launchImmediate: function(strategy, res) {
				res.redirect(
					'https://www.facebook.com/connect/ping?'
						+ querystring.stringify({
							client_id: options.facebookID,
							domain: options.appDomain,
							redirect_uri: immediateCallback,
							origin: 1,
							response_type: 'code'
						})
				);
			},
			
			isValid: function(req) {
				return req.query.code;
			},
			
			finalizeInvalid: function(req, res, redirect) {
				if (req.query.returnHash) {
					// If we need the URL hash, don't redirect, as
					// it causes Safari to drop the URL fragment.
					res.send({ success: true });
				}
				else {
					res.redirect(redirect);
				}
			},
			
			preVerify: function(strategy, immediate) {
				if (immediate) {
					strategy._callbackURL = immediateCallback;
				}
			},
			
			postVerify: function(strategy) {
				strategy._callbackURL = callback;
			}
		};
	}
};
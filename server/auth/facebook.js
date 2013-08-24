var querystring = require('querystring');
var passport = require("passport");
var FacebookStrategy = require('passport-facebook').Strategy;

var name = 'facebook';

module.exports = {
	init: function(options) {
		var callback = options.appDomain + '/auth/' + name + '/return';
		
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
			
			launcher: function(strategy) {
				return function(req, res, next) {
					var immediate = req.query.immediate;
					
					if (immediate) {
						res.redirect(
							'https://www.facebook.com/connect/ping?'
								+ querystring.stringify({
									client_id: options.facebookID,
									domain: options.appDomain,
									redirect_uri: callback + '?immediate=true',
									origin: 1,
									response_type: 'code'
								})
						);
					}
					else {
						passport.authenticate(name)(req, res, next);
					}
				};
			},
			
			finalizer: function(strategy) {
				return function(req, res, next) {
					var immediate = req.query.immediate;
					var redirect = immediate ? '/auth/user' : '/';
					
					if (immediate) {
						if (!req.query.code) {
							res.redirect(
								redirect
									+ (req.query.error
										? ''
										: '?'
											+ querystring.stringify({
												immediate: true,
												returnHash: callback
											})
										)
							);
							
							return;
						}
						else {
							strategy._callbackURL = callback + '?immediate=true';
						}
					}
					
					passport.authenticate(
						name,
						{
							successRedirect: redirect,
							failureRedirect: redirect
						}
					)(req, res, next);
					
					strategy._callbackURL = callback;
				};
			}
		};
	}
};
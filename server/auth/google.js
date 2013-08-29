var passport = require("passport");
var GoogleStrategy = require('passport-google').Strategy;

module.exports = {
	name: 'google',
	
	init: function(options) {
		var name = this.name;
		
		return {
			name: name,
			strategy: GoogleStrategy,
			strategyConfig: {
				returnURL: options.appDomain + '/auth/' + name + '/return',
				realm: options.appDomain
			},
			
			getIdentifier: function(identifier) {
				return identifier;
			},
			
			getProfile: function(identifier, profile) {
				return {
					name: profile.displayName
				};
			},
			
			launcher: function(strategy) {
				return function(req, res, next) {
					var immediate = req.query.immediate;
					
					if (immediate) {
						var party = strategy._relyingParty;
						
						var landing = party.returnUrl;
						party.returnUrl = landing + '?immediate=true';
						
						party.authenticate(
							strategy._providerURL,
							true,
							function(err, url) {
								party.returnUrl = landing;
								
								if (!err) {
									res.redirect(url);
								}
							}
						);
					}
					else {
						passport.authenticate(name)(req, res, next);
					}
				};
			},
			
			finalizer: function() {
				return function(req, res, next) {
					var immediate = req.query.immediate;
					var redirect = immediate ? '/auth/user' : '/';
					
					if (immediate && req.query['openid.mode'] != 'id_res') {
						// failed, don't bother verification ... just redirect to failure
						res.redirect(redirect);
					}
					else {
						passport.authenticate(
							name,
							{
								successRedirect: redirect,
								failureRedirect: redirect
							}
						)(req, res, next);
					}
				};
			}
		};
	}
};
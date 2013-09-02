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
			
			launchImmediate: function(strategy, res) {
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
			},
			
			isValid: function(req) {
				return req.query['openid.mode'] == 'id_res';
			}
		};
	}
};
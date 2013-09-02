var passport = require("passport");
var User = require("./user");

module.exports = {
	init: function(app, provider, options) {
		var name = provider.name;
		provider = provider.init(options);
		
		if (!provider) {
			console.warn("Ignoring authentication provider: " + name);
			return;
		}
		
		var strategy = 
			new provider.strategy(
				provider.strategyConfig,
				function() {
					var identifier = provider.getIdentifier.apply(this, arguments);
					var profile = provider.getProfile.apply(this, arguments);
					var done = arguments[arguments.length - 1];
					
					User.findOne(
						{
							'providers._id': provider.name,
							'providers.remoteID': identifier
						},
						function(err, user) {
							if (!user) {
								user = new User();
							}
							
							user.set(profile);
							user.providers.addToSet({
								_id: provider.name,
								remoteID: identifier
							});
							
							user.save(done);
						}
					);
				}
			);
		
		passport.use(strategy);
		
		app.get(
			'/auth/' + provider.name,
			function(req, res, next) {
				var immediate = req.query.immediate;
				
				if (immediate) {
					provider.launchImmediate(strategy, res);
				}
				else {
					passport.authenticate(name)(req, res, next);
				}
			}
		);
		
		app.get(
			'/auth/' + provider.name + '/return',
			function(req, res, next) {
				var immediate = req.query.immediate;
				var redirect = immediate ? '/auth/user' : '/';
				
				if (immediate && !provider.isValid(req)) {
					// failed, don't bother verification ... just redirect to failure
					if (provider.finalizeInvalid) {
						provider.finalizeInvalid(res, redirect);
					}
					else {
						res.redirect(redirect);
					}
				}
				else {
					if (provider.preVerify) {
						provider.preVerify(strategy, immediate);
					}
					
					passport.authenticate(
						name,
						{
							successRedirect: redirect,
							failureRedirect: redirect
						}
					)(req, res, next);
					
					if (provider.postVerify) {
						provider.postVerify(strategy, immediate);
					}
				}
			}
		);
	}
}
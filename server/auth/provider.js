var passport = require("passport");
var User = require("./user");

module.exports = {
	init: function(app, provider, options) {
		provider = provider.init(options);
		
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
			provider.launcher
				? provider.launcher(strategy)
				: passport.authenticate(provider.name)
		);
		
		app.get(
			'/auth/' + provider.name + '/return',
			provider.finalizer
				? provider.finalizer(strategy)
				: passport.authenticate(
					provider.name,
					{
						successRedirect: '/',
						failureRedirect: '/'
					}
				)
		);
	}
}
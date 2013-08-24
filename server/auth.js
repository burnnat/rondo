var _ = require("lodash");
var passport = require("passport");

var User = require("./auth/user");

var provider = require("./auth/provider");
var google = require("./auth/google");
var facebook = require("./auth/facebook");

module.exports = {
	init: function(app, options) {
		app.use(passport.initialize());
		app.use(passport.session());
		
		app.get('/auth/logout', function(req, res) {
			req.logout();
			res.redirect('/auth/user');
		})
		
		app.get('/auth/user', function(req, res) {
			var user = req.user;
			var data = {
				authenticated: !!user
			};
			
			if (user) {
				_.assign(
					data,
					{
						id: user._id,
						providers: user.providers.map(function(provider) {
							return {
								type: provider._id,
								remoteID: provider.remoteID
							}
						})
					}
				);
			}
			
			res.send({
				success: true,
				user: data
			});
		});
		
		passport.serializeUser(function(user, done) {
			done(null, user._id);
		});
		
		passport.deserializeUser(function(id, done) {
			User.findOne(
				{ _id: id },
				done
			);
		});
		
		provider.init(app, google, options);
		provider.init(app, facebook, options);
	}
};
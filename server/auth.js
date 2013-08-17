var _ = require("lodash");
var mongoose = require("mongoose");
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

var User = mongoose.model(
	'User',
	new mongoose.Schema({
		id: {
			type: String,
			required: true
		}
	})
);

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
						providers: {
							google: user.id
						}
					}
				);
			}
			
			res.send({
				success: true,
				user: data
			});
		});
		
		passport.serializeUser(function(user, done) {
			done(null, user.id);
		});
		
		passport.deserializeUser(function(id, done) {
			User.findOne(
				{ id: id },
				done
			);
		});
		
		var strategy = 
			new GoogleStrategy(
				{
					returnURL: options.appDomain + '/auth/google/return',
					realm: options.appDomain
				},
				function(identifier, profile, done) {
					console.log(profile);
					
					profile.id = identifier;
					
					User.findOneAndUpdate(
						{ id: identifier },
						profile,
						{ upsert: true },
						done
					);
				}
			);
		
		passport.use(strategy);
		
		app.get(
			'/auth/google',
			function(req, res, next) {
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
					passport.authenticate('google')(req, res, next);
				}
			}
		);
		
		app.get(
			'/auth/google/return',
			function(req, res, next) {
				var immediate = req.query.immediate;
				var redirect = immediate ? '/auth/user' : '/';
				
				if (immediate && req.query['openid.mode'] != 'id_res') {
					// failed, don't bother verification ... just redirect to failure
					res.redirect(redirect);
				}
				else {
					passport.authenticate(
						'google',
						{
							successRedirect: redirect,
							failureRedirect: redirect
						}
					)(req, res, next);
				}
			}
		);
	}
};
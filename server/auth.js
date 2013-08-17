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
			res.send({ success: true });
		})
		
		app.get('/auth/user', function(req, res) {
			var user = req.user;
			
			if (user) {
				res.send({
					success: true,
					authorized: true,
					user: user
				});
			}
			else {
				res.send({
					success: true,
					authorized: false
				});
			}
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
		
		passport.use(
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
			)
		);
		
		app.get('/auth/google', passport.authenticate('google'));
		
		app.get(
			'/auth/google/return',
			passport.authenticate(
				'google',
				{
					successRedirect: '/',
					failureRedirect: '/'
				}
			)
		);
	}
};
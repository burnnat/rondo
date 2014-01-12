var _ = require("lodash");
var express = require("express");
var mongoose = require("mongoose");
var async = require("async");
var winston = require("winston");

var info = require('../package.json');

var object = require('./api/object');
var types = [
	require("./api/sketch"),
	require("./api/measure"),
	require("./api/part"),
	require("./api/staff"),
	require("./api/voice")
];

module.exports = {
	init: function(app) {
		app.get('/api', function(req, res) {
			res.send({
				success: true,
				version: info.version
			});
		});
		
		if (app.get('env') != 'production') {
			app.post('/api', function(req, res) {
				var finalize = function(err) {
					res.send({
						success: !err,
						version: info.version
					});
				};
				
				if (req.body.reset === true) {
					async.parallel(
						types.map(function(type) {
							return type.reset;
						}),
						function(err) {
							req.logout();
							finalize(err);
						}
					);
				}
				else if (req.body.close === true) {
					winston.info("Closing database connection");
					
					mongoose.disconnect(function() {
						winston.info("Database connection closed");
						finalize();
					});
				}
				else {
					finalize();
				}
			});
		}
		
		app.all('/api/*', function(req, res, next) {
			if (req.user) {
				next();
			}
			else {
				winston.verbose(
					"Rejecting unauthorized API request",
					_.pick(req, 'url', 'method')
				);
				res.send(403, { success: false });
			}
		});
		
		types.forEach(function(type) {
			object.init(app, type)
		});
	}
};
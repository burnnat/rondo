var express = require("express");
var mongoose = require("mongoose");
var async = require("async");

var info = require('../package.json');
var sketches = require("./api/sketch");

module.exports = {
	init: function(app) {
		app.get('/api', function(req, res) {
			res.send({
				success: true,
				version: info.version
			});
		});
		
		if (app.get('env') != 'production') {
			app.post('/api/reset', function(req, res) {
				async.parallel(
					[
						sketches.reset
					],
					function(err) {
						res.send({
							success: !err
						});
					}
				);
			});
			
			app.post('/api/close', function(req, res) {
				console.log("Closing database connection");
				
				mongoose.disconnect(function() {
				console.log("Database connection closed");
					
					res.send({
						success: true
					});
				});
			});
		}
		
		sketches.init(app);
	}
};
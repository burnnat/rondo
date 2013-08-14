var express = require("express");
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
		}
		
		sketches.init(app);
	}
};
var Q = require('q');
var request = require('supertest');

var info = require('../../../package.json');
var app = request.agent('http://localhost:' + (process.env.PORT || 8080));

var dualPromise = function(fn) {
	return function(done) {
		if (done) {
			fn.call(this, done);
		}
		else {
			var deferred = Q.defer();
			
			fn.call(this, deferred.makeNodeResolver());
			
			return deferred.promise;
		}
	};
};

app.reset = dualPromise(function(callback) {
	app.post('/api')
		.send({ reset: true })
		.expect(
			200,
			{
				success: true,
				version: info.version
			},
			callback
		);
});

app.login = dualPromise(function(callback) {
	app.get('/auth/dummy')
		.end(callback);
});

before(function(done) {
	this.timeout(0);
	var start = Date.now();
	var attempts = 0;
	
	console.log('Waiting for server connection...');
	
	var attempt = function() {
		attempts++;
		app.get('/').end(complete);
	};
	
	var complete = function(err) {
		if (!err || Date.now() - start > 30000) {
			if (err) {
				console.log('Connection timed out');
			}
			else {
				console.log('Connection succeeded after ' + attempts + ' attempts');
			}
			
			done(err);
		}
		else {
			setTimeout(attempt, 250);
		}
	};
	
	attempt();
});

module.exports = app;
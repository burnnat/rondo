var request = require('supertest');
var info = require('../../../package.json');

var app = request.agent('http://localhost:' + (process.env.PORT || 8080));

app.reset = function(done) {
	app.post('/api')
		.send({ reset: true })
		.expect(
			200,
			{
				success: true,
				version: info.version
			},
			done
		);
};

app.login = function(done) {
	app.get('/auth/dummy')
		.end(done);
};

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
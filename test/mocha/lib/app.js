var request = require('supertest');
var app = request('http://localhost:8080');

app.reset = function(done) {
	this.post('/api/reset')
		.expect(
			200,
			{ success: true },
			done
		);
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
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
	
	var attempt = function() {
		console.log('Attempting connection...');
		app.get('/').end(complete);
	};
	
	var complete = function(err) {
		if (!err || Date.now() - start > 30000) {
			if (err) {
				console.log('Connection timed out');
			}
			else {
				console.log('Connection succeeded');
			}
			
			done(err);
		}
		else {
			setTimeout(attempt, 250);
		}
	};
	
	setTimeout(attempt, 250);
});

module.exports = app;
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

module.exports = app;
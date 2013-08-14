var app = require('../lib/app.js');
var info = require('../../../package.json');

describe('API root', function() {
	it('responds with JSON', function(done) {
		app.get('/api')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(
				200,
				{
					success: true,
					version: info.version
				},
				done
			);
	})
})
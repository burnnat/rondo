var app = require('../lib/app.js');
var assert = require('assert');

describe('User API', function() {
	
	describe('before authentication', function() {
		before(app.reset);
		
		it('returns unauthenticated user', function(done) {
			app.get('/auth/user')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(
					200,
					{
						success: true,
						user: {
							authenticated: false
						}
					},
					done
				);
		});
	});
	
	describe('after authentication', function() {
		before(app.login);
		
		it('returns authenticated user', function(done) {
			app.get('/auth/user')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(
					200,
					function(err, res) {
						var body = res.body;
						
						assert.ok(body.success);
						assert.ok(body.user.authenticated);
						
						done(err);
					}
				);
		});
	});
});
var _ = require('lodash');
var assert = require('assert');
var app = require('../lib/app.js');

describe('Sketches API', function() {
	
	before(app.reset);
	before(app.login);
	
	it('fetches sketches', function(done) {
		app.get('/api/sketches')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(
				200,
				{
					success: true,
					records: []
				},
				done
			);
	});
	
	it('adds sketches', function(done) {
		var data = {
			title: 'My title, with \u00AB\u03A3p\u011Bci\u00E1l \u00E7h\u00E4rs\u00BB\u2122!!'
		};
		
		var checkData = function(res) {
			var body = res.body;
			
			assert.ok(body.success);
			
			var record = body.records;
			
			if (_.isArray(record)) {
				record = _.first(record);
			}
			
			for (var field in data) {
				assert.deepEqual(record[field], data[field]);
			}
			
			for (var field in record) {
				if (!(field in data) && field !== 'id') {
					assert.fail(field, null, 'Unmatched field encountered: ' + field, '<=>');
				}
			}
			
			assert.ok(record.id);
		};
		
		app.post('/api/sketches')
			.send(data)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(
				200,
				function(err, res) {
					checkData(res);
					
					if (err) {
						done(err);
					}
					else {
						app.get('/api/sketches')
							.set('Accept', 'application/json')
							.expect('Content-Type', /json/)
							.expect(
								200,
								function(err, res) {
									checkData(res);
									done(err);
								}
							);
					}
				}
			);
	});
	
	describe('individually', function() {
		var record;
		
		beforeEach(function(done) {
			app.get('/api/sketches')
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(
					200,
					function(err, res) {
						record = res.body.records[0];
						done(err);
					}
				);
		});
		
		it('fetches sketches by ID', function(done) {
			app.get('/api/sketches/' + record.id)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(
					200,
					{
						success: true,
						records: record
					},
					done
				);
		});
		
		it('updates sketches by ID', function(done) {
			record.title = '...New Title...';
			
			app.put('/api/sketches/' + record.id)
				.send(record)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(
					200,
					{
						success: true,
						records: record
					},
					done
				);
		});
		
		it('deletes sketches by ID', function(done) {
			app.del('/api/sketches/' + record.id)
				.set('Accept', 'application/json')
				.expect('Content-Type', /json/)
				.expect(
					200,
					{ success: true },
					function(err) {
						if (err) {
							done(err);
						}
						else {
							app.get('/api/sketches')
								.set('Accept', 'application/json')
								.expect('Content-Type', /json/)
								.expect(
									200,
									{
										success: true,
										records: []
									},
									done
								);
						}
					}
				);
		});
	});
});
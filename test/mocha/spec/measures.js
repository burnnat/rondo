var _ = require('lodash');
var assert = require('assert');
var app = require('../lib/app.js');

describe('Measures API', function() {
	
	before(app.reset);
	before(app.login);
	
	var parent;
	
	before(function(done) {
		app.post('/api/sketches')
			.send({
				title: 'Root Sketch'
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(
				200,
				function(err, res) {
					parent = res.body.records.id;
					done(err);
				}
			);
	})
	
	it('fetches measures', function(done) {
		app.get('/api/measures')
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
	
	it('adds measures', function(done) {
		var data = {
			key: 'D',
			time: '4/4',
			sketch_id: parent
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
		
		app.post('/api/measures')
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
						app.get('/api/measures')
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
			app.get('/api/measures')
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
		
		it('fetches measures by ID', function(done) {
			app.get('/api/measures/' + record.id)
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
		
		it('updates measures by ID', function(done) {
			record.key = 'C';
			record.time = '3/4';
			
			app.put('/api/measures/' + record.id)
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
		
		it('deletes measures by ID', function(done) {
			app.del('/api/measures/' + record.id)
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
							app.get('/api/measures')
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
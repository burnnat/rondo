var _ = require('lodash');
var assert = require('assert');
var Q = require('q');

var app = require('./app.js');

module.exports = {
	app: app,
	
	make: function(type, data, done) {
		var deferred = Q.defer();
		
		app.post('/api/' + type)
			.send(data)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(
				200,
				deferred.makeNodeResolver()
			);
		
		return deferred.promise.then(
			function(res) {
				return res.body.records.id;
			}
		);
	},
	
	run: function(setup) {
		var path = setup.path;
		
		describe(setup.name + ' API', function() {
			before(function(done) {
				app.reset()
					.then(function() {
						return app.login();
					})
					.nodeify(done);
			});
			
			if (setup.prep) {
				setup.prep();
			}
			
			it('fetches ' + path, function(done) {
				app.get('/api/' + path)
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
			
			it('adds ' + path, function(done) {
				var data = setup.getData();
				
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
						if (!(field in data) && field !== 'id' && field !== 'revision') {
							assert.fail(field, null, 'Unmatched field encountered: ' + field, '<=>');
						}
					}
					
					assert.ok(record.id);
					assert.equal(record.revision, 1);
				};
				
				app.post('/api/' + path)
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
								app.get('/api/' + path)
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
			
			it('fails on invalid ' + path, function(done) {
				var data = setup.invalidData();
				
				app.post('/api/' + path)
					.send(data)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(
						400,
						{
							success: false
						},
						done
					);
			});
			
			describe('individually', function() {
				var record;
				
				beforeEach(function(done) {
					app.get('/api/' + path)
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
				
				it('fetches ' + path + ' by ID', function(done) {
					app.get('/api/' + path + '/' + record.id)
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
				
				it('updates ' + path + ' by ID', function(done) {
					setup.updateRecord(record);
					record.revision++;
					
					app.put('/api/' + path + '/' + record.id)
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
				
				it('deletes ' + path + ' by ID', function(done) {
					app.del('/api/' + path + '/' + record.id)
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
									app.get('/api/' + path)
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
	}
};

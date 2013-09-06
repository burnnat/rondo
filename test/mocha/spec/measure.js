var test = require('../lib/api');

var parent;

test.run({
	name: 'Measures',
	path: 'measures',
	
	prep: function() {
		before(function(done) {
			test.app
				.post('/api/sketches')
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
		});
	},
	
	getData: function() {
		return {
			key: 'D',
			time: '4/4',
			sketch_id: parent
		};
	},
	
	updateRecord: function(record) {
		record.key = 'C';
		record.time = '3/4';
	}
});
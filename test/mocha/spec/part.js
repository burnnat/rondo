var test = require('../lib/api');

var parent;

test.run({
	name: 'Parts',
	path: 'parts',
	
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
			name: 'Solo',
			group: null,
			sketch_id: parent
		};
	},
	
	updateRecord: function(record) {
		record.name = 'Piano';
		record.group = 'brace';
	}
});
var test = require('../lib/api');

var parent;

test.run({
	name: 'Measures',
	path: 'measures',
	
	prep: function() {
		before(function(done) {
			test.make(
				'sketches',
				{
					title: 'Root Sketch'
				},
				function(err, id) {
					parent = id;
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
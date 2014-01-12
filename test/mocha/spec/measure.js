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
					}
				)
				.then(function(id) {
					parent = id;
				})
				.nodeify(done);
		});
	},
	
	getData: function() {
		return {
			key: 'D',
			time: '4/4',
			sketch_id: parent
		};
	},
	
	invalidData: function() {
		return {
			key: 'Q',
			time: 34
		};
	},
	
	updateRecord: function(record) {
		record.key = 'C';
		record.time = '3/4';
	}
});
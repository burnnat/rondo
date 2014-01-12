var test = require('../lib/api');

var parent;

test.run({
	name: 'Parts',
	path: 'parts',
	
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
			name: 'Solo',
			group: null,
			sketch_id: parent
		};
	},
	
	invalidData: function() {
		return {
			group: 'blue man'
		};
	},
	
	updateRecord: function(record) {
		record.name = 'Piano';
		record.group = 'brace';
	}
});
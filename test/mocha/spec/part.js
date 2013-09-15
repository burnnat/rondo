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
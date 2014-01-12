var test = require('../lib/api');

var parent;

test.run({
	name: 'Staves',
	path: 'staves',
	
	prep: function() {
		before(function(done) {
			test.make(
					'sketches',
					{
						title: 'Root Sketch'
					}
				)
				.then(function(id) {
					return test.make(
						'parts',
						{
							name: 'Parent Part',
							group: null,
							sketch_id: id
						}
					);
				})
				.then(function(id) {
					parent = id;
				})
				.nodeify(done);
		});
	},
	
	getData: function() {
		return {
			clef: 'treble',
			part_id: parent
		};
	},
	
	invalidData: function() {
		return {
			clef: 'rock of ages, clef for thee'
		};
	},
	
	updateRecord: function(record) {
		record.clef = 'bass';
	}
});
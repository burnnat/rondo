var test = require('../lib/api');

var parent;

test.run({
	name: 'Voices',
	path: 'voices',
	
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
					return test.make(
						'staves',
						{
							clef: 'bass',
							part_id: id
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
			staff_id: parent,
			notes: [
				{
					pitches: ['C4', 'Bb3', 'f##3', 'En3'],
					ties: [true, true, false, true],
					duration: 'hd',
					rest: false
				},
				{
					pitches: ['d3'],
					ties: [false],
					duration: 'q',
					rest: true
				}
			]
		};
	},
	
	invalidData: function() {
		return {
			notes: [
				{
					pitches: ['x###0'],
					duration: '3dd'
				}
			]
		};
	},
	
	updateRecord: function(record) {
		var notes = record.notes;
		
		notes[1].duration = '8';
		
		notes.push({
			pitches: ['Bb2'],
			ties: [false],
			duration: '8',
			rest: false
		});
	}
});
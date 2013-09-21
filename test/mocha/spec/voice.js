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
				},
				function(err, id) {
					if (err) {
						done(err);
					}
					else {
						test.make(
							'parts',
							{
								name: 'Parent Part',
								group: null,
								sketch_id: id
							},
							function(err, id) {
								if (err) {
									done(err);
								}
								else {
									test.make(
										'staves',
										{
											clef: 'bass',
											part_id: id
										},
										function(err, id) {
											parent = id;
											done(err);
										}
									);
								}
							}
						);
					}
				}
			);
		});
	},
	
	getData: function() {
		return {
			staff_id: parent,
			notes: [
				{
					pitches: ['C4', 'Bb3', 'f##3', 'En3'],
					duration: 'hd'
				},
				{
					pitches: ['d3'],
					duration: 'qr'
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
		
		notes[1].duration = '8r'
		
		notes.push({
			pitches: ['Bb2'],
			duration: '8'
		});
	}
});
var test = require('../lib/api');

test.run({
	name: 'Sketches',
	path: 'sketches',
	
	getData: function() {
		return {
			title: 'My title, with \u00AB\u03A3p\u011Bci\u00E1l \u00E7h\u00E4rs\u00BB\u2122!!'
		};
	},
	
	updateRecord: function(record) {
		record.title = '...New Title...';
	}
});
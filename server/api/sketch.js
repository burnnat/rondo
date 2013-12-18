var slug = require("slug");
var builder = require("xmlbuilder");

module.exports = {
	name: 'sketches',
	model: 'Sketch',
	
	fields: {
		title: {
			type: String,
			required: true
		}
	},
	
	'export': function(res, sketch) {
		var title = sketch.get('title');
		
		res.attachment(slug(title) + '.xml');
		
		var xml = builder.create(
			'score-timewise',
			{
				version: '1.0',
				encoding: 'UTF-8',
				standalone: false
			},
			{
				// legacy version 
				ext: 'PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"',
				
				// new version, not yet supported by xmlbuilder
				dtd: {
					pubID: '-//Recordare//DTD MusicXML 3.0 Partwise//EN',
					sysID: 'http://www.musicxml.org/dtds/partwise.dtd'
				}
			}
		);
		
		var data = 
			xml
			.attribute('version', '3.0')
			.element('work')
				.element('work-title', title)
				.up()
			.up()
			.element('part-list')
				.element('score-part', { id: 'P1' })
					.element('part-name', 'Lonely Part')
					.up()
				.up()
			.up()
			.element('measure', { number: 1 })
				.element('part', { id: 'P1' })
					.element('attributes')
						.element('divisions', 1)
						.up()
						.element('key')
							.element('fifths', 0)
							.up()
						.up()
						.element('time')
							.element('beats', 4)
							.up()
							.element('beat-type', 4)
							.up()
						.up()
						.element('clef')
							.element('sign', 'G')
							.up()
							.element('line', 2)
							.up()
						.up()
					.up()
					.element('note')
						.element('pitch')
							.element('step', 'C')
							.up()
							.element('octave', 4)
							.up()
						.up()
						.element('duration', 4)
						.up()
						.element('type', 'whole')
						.up()
					.up()
				.up()
			.up()
			.end();
		
		res.send(data);
	}
};
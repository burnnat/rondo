var slug = require("slug");
var async = require("async");
var mongoose = require("mongoose");
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
		
		xml
			.attribute('version', '3.0')
			.element('work')
			.element('work-title', title);
		
		async.parallel(
			[
				function(done) {
					mongoose.model('Part').find(
						{
							sketch_id: sketch.get('_id')
						},
						function(err, parts) {
							if (!err) {
								var partList = xml.element('part-list');
								
								parts.forEach(
									function(part) {
										partList
											.element('score-part', { id: part.get('_id') })
											.element('part-name', part.get('name'));
									}
								);
							}
							
							done(err);
						}
					);
				},
				function(done) {
					mongoose.model('Measure').find(
						{
							sketch_id: sketch.get('_id')
						},
						function(err, measures) {
							if (!err) {
								measures.forEach(
									function(measure, index) {
										xml.element('measure', { number: index });
									}
								);
							}
							
							done(err);
						}
					);
				}
			],
			function(err) {
				res.send(xml.end());
			}
		);
	}
};
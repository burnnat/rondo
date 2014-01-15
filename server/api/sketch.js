var _ = require('lodash');
var slug = require("slug");
var Q = require("q");
var mongoose = require("mongoose");
var builder = require("xmlbuilder");
var winston = require("winston");

var ticks = 32; // ticks per beat

var durations = {
	'w': 1,
	'h': 2,
	'q': 4
};

var noteTypes = {
	'1': 'whole',
	'2': 'half',
	'4': 'quarter',
	'8': 'eighth',
	'16': '16th',
	'32': '32nd',
	'64': '64th'
};

var clefs = {
	treble: {
		sign: 'G',
		line: 2
	},
	bass: {
		sign: 'F',
		line: 4
	},
	tenor: {
		sign: 'C',
		line: 4
	},
	alto: {
		sign: 'C',
		line: 3
	}
};

var buildPartList = function(parent, qparts) {
	var partList = parent.element('part-list');
	
	return (
		qparts
			.then(function(parts) {
				parts.forEach(
					function(part) {
						partList
							.element('score-part', { id: part.id })
							.element('part-name', part.name);
					}
				);
			})
	);
};

var buildMeasures = function(parent, sketch, qparts) {
	return (
		mongoose.model('Measure')
			.find({ sketch_id: sketch.id })
			.exec()
			.then(function(measures) {
				return Q.all(
					measures.map(function(measure, index) {
						return buildMeasure(parent, measure, index + 1, qparts);
					})
				);
			})
	);
};

var buildMeasure = function(parent, measure, number, qparts) {
//	var key = measure.key;
//	var time = measure.time;
	
	var key = {
		fifths: 0,
		mode: 'major'
	};
	
	var time = {
		beats: 4,
		beatType: 4
	};
	
	var measureXml = parent.element('measure', { number: number })
	
	return (
		Q.all([
			qparts,
			mongoose.model('Voice')
				.find({ measure_id: measure.id })
				.exec()
		])
		.spread(function(parts, voices) {
			return Q.all(
				parts.map(function(part) {
					return buildPart(measureXml, key, time, part, voices);
				})
			);
		})
	);
};

var buildPart = function(parent, key, time, part, voices) {
	var partXml = parent.element('part', { id: part.id });
	var attrXml = partXml.element('attributes');
	
	attrXml
		.element('divisions', ticks * time.beats)
		.up()
		.element('key')
			.element('fifths', key.fifths)
			.up()
			.element('mode', key.mode)
			.up()
		.up()
		.element('time')
			.element('beats', time.beats)
			.up()
			.element('beat-type', time.beatType)
			.up()
		.up();
	
	var voicesByStaff = _.groupBy(voices, 'staff_id');
	
	return (
		mongoose.model('Staff')
			.find({ part_id: part.id })
			.exec()
			.then(function(staves) {
				attrXml.element('staves', staves.length);
				
				var backup = null;
				
				staves.forEach(function(staff, index) {
					var clef = clefs[staff.clef];
					
					attrXml
						.element('clef')
							.element('sign', clef.sign)
							.up()
							.element('line', clef.line)
							.up()
						.up();
					
					buildStaff(partXml, index + 1, voicesByStaff[staff.id]);
				});
			})
	);
};

var buildStaff = function(parent, staffNumber, voices) {
	voices.forEach(function(voice) {
		var total = 0;
		var notes = voice.notes || [];
		
		notes.forEach(function(note) {
			total += buildNote(parent, staffNumber, note);
		});
		
		partXml.element('backup').element('duration', backup);
	});
};

var buildNote = function(parent, staffNumber, note) {
	var duration = note.duration;
	
	if (durations[duration]) {
		duration = durations[duration];
	}
	else {
		duration = parseInt(duration);
	}
	
	var type = noteTypes[duration];
	
	duration = ticks * 4 / duration;
	
	note.pitches.forEach(function(pitch, index) {
		var noteXml = parent.element('note');
		
		if (index > 0) {
			noteXml.element('chord');
		}
		
		var pitchParts = pitch.split('/');
		
		noteXml
			.element('pitch')
				.element('step', pitchParts[0])
				.up()
				.element('octave', pitchParts[1])
				.up()
			.up()
			.element('duration', duration)
			.up()
			.element('type', type)
			.up()
			.element('staff', staffNumber)
			.up();
	});
	
	return duration;
};

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
		
		var xml = builder.create(
			'score-timewise',
			{
				version: '1.0',
				encoding: 'UTF-8',
				standalone: false
			},
			{
				pubID: '-//Recordare//DTD MusicXML 3.0 Timewise//EN',
				sysID: 'http://www.musicxml.org/dtds/timewise.dtd'
			}
		);
		
		xml
			.attribute('version', '3.0')
			.element('work')
			.element('work-title', title);
		
		var parts = Q(
			mongoose.model('Part')
				.find({ sketch_id: sketch.id })
				.exec()
		);
		
		Q.all([
			buildPartList(xml, parts),
			buildMeasures(xml, sketch, parts)
		]).done(
			function() {
				res.attachment(slug(title) + '.xml');
				res.send(xml.end());
			},
			function(err) {
				winston.error(err instanceof Error ? err.stack : err);
				res.send(400);
			}
		);
	}
};
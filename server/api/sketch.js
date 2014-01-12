var slug = require("slug");
var Q = require("q");
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
		
		var xml = builder.create(
			'score-timewise',
			{
				version: '1.0',
				encoding: 'UTF-8',
				standalone: false
			},
			{
				pubID: '-//Recordare//DTD MusicXML 3.0 Partwise//EN',
				sysID: 'http://www.musicxml.org/dtds/partwise.dtd'
			}
		);
		
		xml
			.attribute('version', '3.0')
			.element('work')
			.element('work-title', title);
		
		var parts = 
			mongoose.model('Part')
				.find({ sketch_id: sketch.id })
				.exec();
		
		Q.all([
			parts
				.then(function(parts) {
					var partList = xml.element('part-list');
					
					parts.forEach(
						function(part) {
							partList
								.element('score-part', { id: part.id })
								.element('part-name', part.name);
						}
					);
				}),
			parts
				.then(function(parts) {
					var data = {};
					
					return (
						Q.all(
							parts.map(function(part) {
								var id = part.id;
								
								return (
									mongoose.model('Staff')
										.find({ part_id: id })
										.exec()
										.then(function(staves) {
											data[id] = staves.map(function(staff) {
												return staff;
											});
										})
								);
							})
						)
						.then(
							function() {
								return data;
							}
						)
					);
				})
				.then(function(staffList) {
					return (
						mongoose.model('Measure')
							.find({ sketch_id: sketch.id })
							.exec()
							.then(function(measures) {
								return Q.all(
									measures.map(function(measure, index) {
										var measureXml = xml.element('measure', { number: index + 1 });
										
										var ticks = 32; // ticks per quarter note
										
										return (
											mongoose.model('Voice')
												.find({ measure_id: measure.id })
												.exec()
												.then(function(voices) {
													var voiceList = {};
													
													voices.forEach(function(voice) {
														var staffId = voice.get('staff_id', String);
														var array = voiceList[staffId];
														
														if (!array) {
															array = voiceList[staffId] = [];
														}
														
														array.push(voice);
													});
													
													var partId;
													var partXml;
													var attrXml;
													var staves;
													
													for (partId in staffList) {
														partXml = measureXml.element('part', { id: partId });
														attrXml = partXml.element('attributes');
														
														staves = staffList[partId];
														
														attrXml
															.element('staves', staves.length)
															.up()
															.element('divisions', ticks * 4)
															.up();
															
														var backup = null;
														
														staves.forEach(function(staff) {
															if (index === 0) {
																// this is invalid MusicXML, we need to convert to sign and line here
																attrXml.element('clef', staff.clef);
															}
															
															voiceList[staff.id()].forEach(function(voice) {
																if (backup !== null) {
																	partXml.element('backup').element('duration', backup);
																}
																
																voice.notes.forEach(function(note) {
																	var duration = note.duration;
																	var type;
																	
																	if (duration === 'w') {
																		duration = 1;
																	}
																	else if (duration === 'h') {
																		duration = 2;
																	}
																	else if (duration === 'q') {
																		duration = 4;
																	}
																	else {
																		duration = parseInt(duration);
																	}
																	
																	if (duration === 1) {
																		type = 'whole';
																	}
																	else if (duration === 2) {
																		type = 'half';
																	}
																	else if (duration === 4) {
																		type = 'quarter';
																	}
																	else if (duration === 8) {
																		type = 'eighth';
																	}
																	else if (duration === 16) {
																		type = '16th';
																	}
																	else if (duration === 32) {
																		type = '32nd';
																	}
																	else if (duration === 64) {
																		type = '64th';
																	}
																	
																	duration = ticks * 4 / duration;
																	backup += duration;
																	
																	note.pitches.forEach(function(pitch, pitchIndex) {
																		var noteXml = partXml.element('note');
																		
																		if (pitchIndex > 0) {
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
																			.up();
																	})
																});
															});
														});
													}
												})
										);
									})
								);
							})
					);
				})
		]).done(
			function() {
				res.attachment(slug(title) + '.xml');
				res.send(xml.end());
			},
			function(err) {
				console.error(err);
				res.send(400, { success: false });
			}
		);
	}
};
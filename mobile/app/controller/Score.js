/**
 * 
 */
Ext.define('Rondo.controller.Score', {
	extend: 'Ext.app.Controller',
	
	uses: [
		'Tutti.Theory',
		'Tutti.touch.input.NotePanel'
	],
	
	config: {
		control: {
			score: {
				tap: 'onScoreTap'
			},
			
			keyboard: {
				keytap: 'onKeyTap'
			},
			
			rest: {
				tap: 'onRestTap'
			},
			
			measure: {
				blocktap: 'onMeasureTap',
				blockhold: 'onMeasureHold'
			}
		},
		
		refs: {
			keyboard: 'sketchviewer keyboard',
			rest: 'sketchviewer button',
			score: 'score',
			measure: 'score block'
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {Boolean} create
	 * @param {Boolean} rests
	 * 
	 * @return {Tutti.touch.input.NotePanel}
	 */
	getNotePanel: function(create, rests) {
		var panel = this.notePanel;
		
		if (!panel) {
			panel = this.notePanel = new Tutti.touch.input.NotePanel({
				modal: true,
				hideOnMaskTap: true,
				listeners: {
					'save': this.onNoteSave,
					'delete': this.onNoteDelete,
					scope: this
				}
			});
		}
		
		panel.setCreate(create);
		panel.setRests(rests);
		
		return panel;
	},
	
	onKeyTap: function(key) {
		var pitch = key.getPitch();
		var active = this.getScore().getActiveBlock();
		
		if (active) {
			if (active.isCursor) {
				this.tappedPitch = pitch;
				this.getNotePanel(true, false).showBy(key, 'bc-tc?');
			}
			else if (active.isNote) {
				this.modifyPitches(
					active.getVoice(),
					pitch,
					function(pitches) {
						active.getData().set({
							pitches: pitches,
							rest: false
						});
					}
				);
			}
		}
	},
	
	onRestTap: function() {
		var active = this.getScore().getActiveBlock();
		
		if (active) {
			if (active.isCursor) {
				this.getNotePanel(true, true).showBy(this.getRest(), 'bc-tc?');
			}
			else if (active.isNote) {
				active.getData().set({
					rest: true
				});
			}
		}
	},
	
	onScoreTap: function() {
		this.getScore().setActiveBlock(null);
	},
	
	onMeasureTap: function(item, event) {
		if (item && item.isCursor) {
			item.snapNear(event.pageX);
		}
		
		this.getScore().setActiveBlock(item);
	},
	
	onMeasureHold: function(item, event) {
		if (item && item.isNote) {
			this.getScore().setActiveBlock(item);
			
			var panel = this.getNotePanel(false, item.getData().get('rest'));
			
			panel.setDuration(item.getDuration());
			panel.setTied(item.isTied(0));
			
			panel.showBy(item, item.isStemUp() ? 'tc-bc?' : 'bc-tc?');
		}
	},
	
	onNoteSave: function(panel) {
		var active = this.getScore().getActiveBlock();
		
		var duration = panel.getDurationString();
		var tied = panel.getTied();
		
		if (active) {
			if (active.isCursor) {
				var score = this.getScore();
				var voice = active.getVoice();
				var index = active.getIndex();
				
				var tappedPitch = this.tappedPitch;
				var ticks = Tutti.Theory.durationToTicks(duration);
				var underflow = voice.getTicksRemaining();
				
				var subdivisions = Tutti.Theory.ticksToDurations(Tutti.Util.min(ticks, underflow));
				var subduration;
				var subtied;
				
				var isRest = panel.getRests();
				
				while (ticks.numerator > 0) {
					subduration = subdivisions.pop();
					ticks.subtract(Tutti.Theory.durationToTicks(subduration));
					
					subtied = ticks.numerator > 0 || tied;
					
					this.modifyPitches(
						voice,
						tappedPitch,
						function(pitches, notes) {
							notes.insert(
								index++,
								new Tutti.model.Note({
									pitches: pitches,
									ties: isRest
										? []
										: Ext.Array.map(
											pitches,
											function() { return subtied; }
										),
									duration: subduration,
									rest: isRest
								})
							);
						}
					);
					
					if (voice.isComplete()) {
						voice = score
							.getComponent(
								score.indexOf(voice.getMeasure()) + 1
							)
							.getVoicesForStaff(
								voice.getData().getStaff()
							)
							.first();
						index = 0;
						
						if (ticks.numerator > 0) {
							underflow = voice.getTicksRemaining();
							subdivisions.push.apply(
								subdivisions,
								Tutti.Theory.ticksToDurations(Tutti.Util.min(ticks, underflow))
							);
						}
					}
				}
				
				active = voice.cursor;
				active.setIndex(index);
				score.setActiveBlock(active);
			}
			else if (active.isNote) {
				this.modifyNotes(
					active.getVoice(),
					function(pitches) {
						var ties = [];
						
						for (var i = 0; i < pitches.getCount(); i++) {
							ties[i] = tied;
						}
						
						active.getData().set({
							duration: duration,
							ties: ties
						});
					}
				);
			}
		}
	},
	
	onNoteDelete: function() {
		var active = this.getScore().getActiveBlock();
		
		if (active && active.isNote) {
			var note = active.getData();
			
			this.modifyNotes(
				active.getVoice(),
				function(notes) {
					notes.remove(note);
				}
			);
		}
	},
	
	modifyNotes: function(voice, fn) {
		var notes = voice.getData().notes();
		
		fn(notes);
		
		notes.sync();
	},
	
	modifyPitches: function(voice, rawPitch, fn) {
		var pitches = rawPitch
			? [
				Tutti.Theory.getNoteFromPitch(
					rawPitch,
					voice.getMeasure().getData().getResolvedKey()
				)
			]
			: [];
		
		this.modifyNotes(
			voice,
			function(notes) {
				fn(pitches, notes);
			}
		);
	}
});
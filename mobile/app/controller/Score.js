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
			
			measure: {
				blocktap: 'onMeasureTap',
				blockhold: 'onMeasureHold'
			}
		},
		
		refs: {
			keyboard: 'keyboard',
			score: 'score',
			measure: 'score block'
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {Boolean} create
	 * 
	 * @return {Tutti.touch.input.NotePanel}
	 */
	getNotePanel: function(create) {
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
		
		return panel;
	},
	
	onKeyTap: function(key) {
		var pitch = key.getPitch();
		var active = this.getScore().getActiveBlock();
		
		if (active) {
			if (active.isCursor) {
				this.tappedPitch = pitch;
				this.getNotePanel(true).showBy(key, 'bc-tc?');
			}
			else if (active.isNote) {
				this.modifyPitches(
					active.getVoice(),
					pitch,
					function(pitches) {
						active.getData().set('pitches', pitches);
					}
				);
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
			
			var panel = this.getNotePanel(false);
			
			panel.setDuration(item.getDuration());
			panel.setTied(item.isTied(0));
			
			panel.showBy(item, item.isStemUp() ? 'tc-bc?' : 'bc-tc?');
		}
	},
	
	onNoteSave: function(duration, tied) {
		var active = this.getScore().getActiveBlock();
		
		if (active) {
			if (active.isCursor) {
				var voice = active.getVoice();
				var index = active.getIndex();
				
				var noteCount = 0;
				
				this.modifyPitches(
					voice,
					this.tappedPitch,
					function(pitches, notes) {
						notes.insert(
							index,
							[
								new Tutti.model.Note({
									pitches: pitches,
									ties: Ext.Array.map(pitches, function() { return tied; }),
									duration: duration
								})
							]
						);
						
						noteCount = notes.getCount();
					}
				);
				
				index += 1;
				
				active.setIndex(index);
				
				if (voice.isComplete() && index >= noteCount) {
					var score = this.getScore();
					
					var nextMeasure = score.getComponent(score.indexOf(voice.getMeasure()) + 1);
					var nextVoices = nextMeasure.getVoicesForStaff(
						voice.getData().getStaff()
					);
					
					if (nextVoices.getCount() > 0) {
						var cursor = nextVoices.first().cursor;
						cursor.setIndex(0);
						score.setActiveBlock(cursor);
					}
				}
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
		var pitches = [
			Tutti.Theory.getNoteFromPitch(
				rawPitch,
				voice.getMeasure().getData().getResolvedKey()
			)
		];
		
		this.modifyNotes(
			voice,
			function(notes) {
				fn(pitches, notes);
			}
		);
	}
});
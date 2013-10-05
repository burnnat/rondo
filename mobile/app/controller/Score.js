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
			this.getNotePanel(false).showBy(item, item.isStemUp() ? 'tc-bc?' : 'bc-tc?');
		}
	},
	
	onNoteSave: function(duration) {
		var active = this.getScore().getActiveBlock();
		
		if (active) {
			if (active.isCursor) {
				var index = active.getIndex();
				
				this.modifyPitches(
					active.getVoice(),
					this.tappedPitch,
					function(pitches, notes) {
						notes.insert(
							index,
							[
								new Tutti.model.Note({
									pitches: pitches,
									duration: duration
								})
							]
						);
					}
				);
				
				active.setIndex(index + 1);
			}
			else if (active.isNote) {
				this.modifyNotes(
					active.getVoice(),
					function(pitches) {
						active.getData().set('duration', duration);
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
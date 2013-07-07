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
				blocktap: 'onMeasureTap'
			}
		},
		
		refs: {
			keyboard: 'keyboard',
			score: 'score',
			measure: 'score block'
		}
	},
	
	onKeyTap: function(key) {
		var pitch = key.getPitch();
		var active = this.getScore().getActiveBlock();
		
		if (active && active.isCursor) {
			this.tappedPitch = pitch;
			
			if (!this.notePanel) {
				this.notePanel = new Tutti.touch.input.NotePanel({
					modal: true,
					hideOnMaskTap: true,
					listeners: {
						create: this.onCreate,
						scope: this
					}
				});
			}
			
			this.notePanel.showBy(key, 'bc-tc?');
		}
		else {
			this.modifyNotes(
				active.getVoice(),
				pitch,
				function(pitches) {
					active.getData().set('pitches', pitches);
				}
			);
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
	
	onCreate: function(duration) {
		var active = this.getScore().getActiveBlock();
		
		if (active && active.isCursor) {
			var index = active.getIndex();
			
			this.modifyNotes(
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
	},
	
	modifyNotes: function(voice, rawPitch, fn) {
		var notes = voice.getData().notes();
		
		var pitches = [
			Tutti.Theory.getNoteFromPitch(
				rawPitch,
				voice.getMeasure().getData().getResolvedKey()
			)
		];
		
		fn(pitches, notes);
		
		notes.sync();
	}
});
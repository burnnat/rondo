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
		this.tappedPitch = key.getPitch();
		
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
	},
	
	onScoreTap: function() {
		this.getScore().setActiveBlock(null);
	},
	
	onMeasureTap: function(item) {
		this.getScore().setActiveBlock(item);
	},
	
	onCreate: function(duration) {
		var active = this.getScore().getActiveBlock();
		
		if (active) {
			var measure = active.getPart().getMeasure().getData();
			var staff = active.getData();
			
			var voices = measure.voices();
			var voice;
			
			var match = voices.findBy(function(voice) {
				return voice.getStaff().getId() === staff.getId();
			});
			
			if (match < 0) {
				voice = new Tutti.model.Voice();
				voice.setStaff(staff);
				
				voices.add(voice);
				voices.sync();
			}
			else {
				voice = voices.getAt(match);
			}
			
			var notes = voice.notes();
			notes.add(
				new Tutti.model.Note({
					pitches: [
						Tutti.Theory.getNoteFromPitch(this.tappedPitch, measure.getResolvedKey())
					],
					duration: duration
				})
			);
			notes.sync();
		}
	}
});
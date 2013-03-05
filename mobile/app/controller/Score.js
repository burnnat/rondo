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
			keyboard: {
				keytap: 'onKeyTap'
			}
		},
		
		refs: {
			keyboard: 'keyboard',
			score: 'score'
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
	
	onCreate: function(duration) {
		var score = this.getScore();
		var sketch = score.getSketch();
		var measure = sketch.measures().first();
		var voices = measure.voices();
		var voice = voices.first();
		
		var note = {
			keys: [
				Tutti.Theory.getNoteFromPitch(this.tappedPitch, measure.getResolvedKey())
			],
			duration: duration
		};
		
		if (voice) {
			var notes = voice.getNoteData();
			notes.push(note);
			voice.set('notes', notes);
		}
		else {
			voice = new Tutti.model.Voice({
				notes: [note]
			});
			
			voice.setStaff(
				sketch.parts().first().staves().first()
			);
			
			voices.add(voice);
		}
		
		voices.sync();
		score.refreshBlock(0);
	}
});
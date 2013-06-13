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
		
		if (!voice) {
			voice = new Tutti.model.Voice();
			
			voice.setStaff(
				sketch.parts().first().staves().first()
			);
			
			voices.add(voice);
			voices.sync();
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
});
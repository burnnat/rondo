/**
 * 
 */
Ext.define('Tutti.touch.score.VoiceLink', {
	
	config: {
		measure: null,
		data: null,
		time: null
	},
	
	/**
	 * 
	 */
	constructor: function(config) {
		this.initConfig(config);
		
		var data = this.getData();
		
		var voice = this.voice = new Vex.Flow.Voice(this.getTime());
		
		voice.setMode(Vex.Flow.Voice.Mode.SOFT);
		voice.setStave(
			this.getMeasure().getStaff(data.getStaff()).primitive
		);
		
		var store = data.notes();
		
		store.each(this.addNote, this);
		
		store.on({
			addrecords: this.addNotes,
			removerecords: this.removeNotes,
			updaterecord: this.updateNote,
			scope: this
		});
	},
	
	addNote: function(note) {
		var primitive = new Vex.Flow.StaveNote({
			keys: note.getPitchData(),
			duration: note.get('duration')
		});
		
		primitive.setStave(this.voice.stave);
		
		this.getMeasure().items.add(primitive);
		this.voice.addTickable(primitive);
	},
	
	removeNote: function(note) {
		// TODO: implement this method
	},
	
	updateLayout: function() {
		var items = this.getMeasure().items;
		
		if (this.beams) {
			items.removeAll(this.beams);
		}
		
		this.beams = Vex.Flow.Beam.applyAndGetBeams(this.voice);
		items.addAll(this.beams);
	},
	
	addNotes: function(store, records) {
		Ext.Array.forEach(
			records,
			function(note) {
				// TODO: allow note insertion, not just appending
				this.addNote(note, store.indexOf(note));
			},
			this
		);
		
		this.getMeasure().refresh({
			format: true,
			repaint: true
		});
	},
	
	removeNotes: function(store, records) {
		Ext.Array.forEach(records, this.removeNote, this);
	},
	
	updateNote: function(store, record, newIndex, oldIndex, fieldNames, fieldValues) {
		// TODO: implement this method
	}
});
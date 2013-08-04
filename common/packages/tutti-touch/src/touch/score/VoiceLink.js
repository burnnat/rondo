/**
 * 
 */
Ext.define('Tutti.touch.score.VoiceLink', {
	
	uses: [
		'Tutti.KeyManager',
		'Tutti.Util',
		'Tutti.touch.score.Cursor',
		'Tutti.touch.score.Note',
		'Vex.Flow.Beam',
		'Vex.Flow.Voice'
	],
	
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
		this.notes = [];
		
		var staff = this.getMeasure().getStaff(data.getStaff());
		var voice = this.voice = new Vex.Flow.Voice(this.getTime());
		
		voice.setMode(Vex.Flow.Voice.Mode.SOFT);
		voice.setStave(staff.primitive);
		
		this.cursor = new Tutti.touch.score.Cursor({
			voice: this,
			staff: staff
		});
		
		this.getMeasure().items.add(this.cursor);
		
		var store = data.notes();
		
		store.each(this.addNote, this);
		
		store.on({
			addrecords: this.addNotes,
			removerecords: this.removeNotes,
			updaterecord: this.updateNote,
			scope: this
		});
	},
	
	addNote: function(note, index) {
		var note = new Tutti.touch.score.Note({
			voice: this,
			data: note
		});
		
		note.registerWithVoice(this.voice, index);
		
		this.getMeasure().items.insert(index, note);
		
		Ext.Array.insert(
			this.notes,
			index,
			[note]
		);
	},
	
	removeNote: function(note) {
		// TODO: implement this method
	},
	
	updateLayout: function() {
		var voice = this.voice;
		var measure = this.getMeasure();
		var items = measure.items;
		
		if (this.beams) {
			items.removeAll(this.beams);
		}
		
		var keyManager = new Tutti.KeyManager({
			key: measure.getData().getResolvedKey()
		});
		
		Ext.Array.forEach(this.notes, function(note) {
			note.updateLayout(voice);
			
			note.clearAccidentals();
			
			note.eachPitch(function(pitch, index) {
				var accidental = keyManager.selectAccidental(pitch);
				
				if (accidental) {
					note.addAccidental(index, accidental);
				}
			});
		});
		
		this.beams = Vex.Flow.Beam.applyAndGetBeams(voice);
		items.addAll(this.beams);
	},
	
	afterLayout: function() {
		this.cursor.updateLayout();
	},
	
	addNotes: function(store, records) {
		Ext.Array.forEach(
			records,
			function(note) {
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
		var notes = this.notes;
		var note = notes[oldIndex];
		
		if (newIndex != oldIndex) {
			Tutti.Util.move(notes, oldIndex, newIndex);
		}
		
		note.reregister();
		
		this.getMeasure().refresh({
			format: true,
			repaint: true
		});
	},
	
	getNote: function(index) {
		return this.notes[index];
	},
	
	findInsertionPoint: function(x) {
		return Tutti.Util.findInsertionPoint(
			this.notes,
			x,
			function(note) {
				return note.getX();
			}
		);
	}
});
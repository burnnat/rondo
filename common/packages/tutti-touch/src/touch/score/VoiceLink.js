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
	
	/**
	 * @private
	 * 
	 * @param {Tutti.model.Note} note
	 * @param {Number} index
	 */
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
	
	/**
	 * @private
	 * 
	 * @param {Tutti.model.Note} note
	 */
	removeNote: function(note) {
		var notes = this.notes;
		
		var match = Ext.Array.each(
			notes,
			function(noteLink) {
				return !(noteLink.getData() == note);
			}
		);
		
		if (match === true) {
			return;
		}
		
		var removed = Ext.Array.splice(notes, match, 1)[0];
		
		removed.deregisterWithVoice(this.voice);
		
		this.getMeasure().items.remove(removed);
	},
	
	updateLayout: function() {
		var voice = this.voice;
		var measure = this.getMeasure();
		var items = measure.items;
		
		if (this.beams) {
			items.removeAll(this.beams);
		}
		
		if (this.ties) {
			items.removeAll(this.ties);
		}
		
		var keyManager = new Tutti.KeyManager({
			key: measure.getData().getResolvedKey()
		});
		
		var ties = [];
		var nextTies = {};
		var prevTies;
		
		Ext.Array.forEach(this.notes, function(note) {
			note.updateLayout(voice);
			
			note.clearAccidentals();
			note.clearDots();
			
			prevTies = nextTies;
			nextTies = {};
			
			note.eachPitch(function(pitch, index) {
				var accidental = keyManager.selectAccidental(pitch);
				
				if (accidental) {
					note.addAccidental(index, accidental);
				}
				
				if (note.isTied(index)) {
					if (!nextTies[pitch]) {
						ties.push(
							nextTies[pitch] = {
								first_note: note.primitive,
								first_indices: [index]
							}
						);
					}
				}
				
				if (prevTies[pitch]) {
					Ext.apply(
						prevTies[pitch],
						{
							last_note: note.primitive,
							last_indices: [index]
						}
					);
				}
			});
			
			for (var i = 0; i < note.getDuration().dots; i++) {
				note.addDot();
			}
		});
		
		this.beams = Vex.Flow.Beam.applyAndGetBeams(voice);
		items.addAll(this.beams);
		
		this.ties = Ext.Array.map(
			ties,
			function(tie) {
				return new Vex.Flow.StaveTie(tie);
			}
		);
		items.addAll(this.ties);
	},
	
	afterLayout: function() {
		this.cursor.updateLayout();
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Store} store
	 * @param {Ext.data.Model[]} records
	 */
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
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Store} store
	 * @param {Ext.data.Model[]} records
	 */
	removeNotes: function(store, records) {
		Ext.Array.forEach(records, this.removeNote, this);
		
		this.getMeasure().refresh({
			format: true,
			repaint: true
		});
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Store} store
	 * @param {Ext.data.Model} record
	 * @param {Number} newIndex
	 * @param {Number} oldIndex
	 * @param {String[]} fieldNames
	 * @param {Object} fieldValues
	 */
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
	
	/**
	 * @param {Number} index
	 * 
	 * @return {Tutti.touch.score.Note}
	 */
	getNote: function(index) {
		return this.notes[index];
	},
	
	/**
	 * @param {Number} x
	 * 
	 * @return {Number}
	 */
	findInsertionPoint: function(x) {
		return Tutti.Util.findInsertionPoint(
			this.notes,
			x,
			function(note) {
				return note.getX();
			}
		);
	},
	
	/**
	 * @return {Boolean}
	 */
	isComplete: function() {
		var voice = this.voice;
		// voice.isComplete() won't work if we're not in "strict" mode
		return voice.ticksUsed.equals(voice.totalTicks);
	}
});
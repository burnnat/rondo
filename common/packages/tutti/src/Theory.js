/**
 * 
 */
Ext.define('Tutti.Theory', {
	extend: 'Vex.Flow.Music',
	singleton: true,
	
	/**
	 * @property {String[]}
	 */
	FIFTHS: null,
	
	/**
	 * @property
	 */
	NUM_SCALE: 7,
	
	init: function() {
		var roots = Vex.Flow.Music.roots;
		var scaleLength = roots.length;
		
		var fifths = [];
		var i;
		
		Ext.Array.forEach(
			Vex.Flow.Music.accidentals,
			function(accidental) {
				accidental = accidental == 'n' ? '' : accidental;
				
				for (i = 0; i < scaleLength; i++) {
					fifths.push(roots[(4*i + 3) % scaleLength] + accidental);
				}
			}
		)
		
		this.NUM_SCALE = scaleLength;
		this.FIFTHS = fifths;
		this.FIFTHS_INDEX = Ext.Array.map(
			fifths,
			function(note) {
				return this.getNoteValue(note);
			},
			this
		);
	},
	
	getCanonicalNoteName: function(offset, key) {
		if (!key) {
			return this.callParent(arguments);
		}
		else {
			var key = this.getKeyParts(key);
			
			var match = Ext.Array.indexOf(
				this.FIFTHS_INDEX,
				offset,
				Ext.Array.indexOf(
					this.FIFTHS,
					key.root + (key.accidental || '')
				) - (key.type == 'M' ? 3 : 6)
			);
			
			return this.FIFTHS[match];
		}
	},
	
	getNoteFromPitch: function(pitch, key) {
		var name = this.getCanonicalNoteName(pitch % 12, key);
		var value = Vex.Flow.Music.noteValues[name];
		
		var adjustment = (
				(Vex.Flow.Music.root_values[value.root_index]
					- value.int_val
					+ 1.5 * Vex.Flow.Music.NUM_TONES)
				% 12
			)
			- (Vex.Flow.Music.NUM_TONES / 2);
		
		return name + '/' +
			(Math.floor((pitch + adjustment) / 12) - 1);
	},
	
	getNoteParts: function(note) {
		var split = note.split("/");
		var name = split[0];
		
		var parts = this.callParent([name]);
		
		parts.name = name;
		
		if (split.length > 1) {
			parts.octave = parseInt(split[1]);
		}
		
		return parts;
	},
	
	/**
	 * Formats a note string (or object from #getNoteParts()) for display.
	 * 
	 * @param {String/Object} note
	 * 
	 * @return {String}
	 */
	formatNote: function(note) {
		if (!Ext.isObject(note)) {
			note = Tutti.Theory.getNoteParts(note);
		}
		
		var accidental = note.accidental || '';
		
		return note.root.toUpperCase()
			+ accidental
				// Ext.String.htmlDecode() only recognizes some entities, so:
				.replace(/#/g, '&#9839;') // rather than &sharp; or &#x266F;
				.replace(/b/g, '&#9837;') // rather than &flat; or &#x266D;
				.replace(/n/g, '');
	},
	
	/**
	 * @param {String} key
	 * @return {String}
	 */
	formatKey: function(key) {
		var key = this.getKeyParts(key);
		return this.formatNote(key) + ' ' + (key.type === 'M' ? 'Major' : 'Minor');
	}
});
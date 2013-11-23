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
	
	/**
	 * @private
	 * @property
	 */
	RESOLUTION_POW: 1,
	
	/**
	 * @private
	 * @property
	 * 
	 * The inverse of Vex.Flow#durationAliases, mapping duration
	 * values back to their human-friendly, aliased forms.
	 */
	ALIASED_DURATIONS: {},
	
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
		
		this.RESOLUTION_POW = Math.log(Vex.Flow.RESOLUTION) / Math.LN2;
		
		var aliases = this.ALIASED_DURATIONS;
		
		Ext.Object.each(
			Vex.Flow.durationAliases,
			function(alias, duration) {
				aliases[duration] = alias;
			}
		);
	},
	
	/**
	 * @param {String} key
	 * 
	 * @return {Object}
	 */
	getScaleToneAccidentals: function(key) {
		var scale = {};
		var offset = this.getRootOffset(key);
		
		var i, note;
		
		for (i = 0; i < this.NUM_SCALE; i++) {
			note = this.getKeyParts(this.FIFTHS[offset - 1 + i]);
			scale[note.root] = note.accidental || 'n';
		}
		
		return scale;
	},
	
	/**
	 * @param {Number} pitch
	 * @param {String} key
	 * 
	 * @return {String}
	 */
	getCanonicalNoteName: function(pitch, key) {
		if (!key) {
			return this.callParent(arguments);
		}
		else {
			var match = Ext.Array.indexOf(
				this.FIFTHS_INDEX,
				pitch,
				this.getRootOffset(key) - 3
			);
			
			return this.FIFTHS[match];
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {String} key
	 */
	getRootOffset: function(key) {
		var parts = this.getKeyParts(key);
		
		return Ext.Array.indexOf(
				this.FIFTHS,
				parts.root
					+ (parts.accidental || '')
			) - (
				parts.type == 'M'
					? 0
					: 3
			);
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
	},
	
	/**
	 * Takes a given number of ticks and divides it into
	 * a set of discrete note (or rest) durations.
	 * 
	 * TODO: Currently assumes a simple, not compound, meter.
	 * TODO: Has no handling for tuplet durations.
	 * 
	 * @param {Vex.Flow.Fraction} ticks
	 * 
	 * @return {String[]}
	 */
	ticksToDurations: function(ticks) {
		// Ignore any fractional components, thus prohibiting tuplets.
		var raw = ticks.quotient();
		
		var durations = [];
		var maxPower, maxTicks, duration;
		
		while (raw > 0) {
			maxPower = Math.floor(Math.log(raw) / Math.LN2);
			maxTicks = Math.pow(2, maxPower);
			
			duration = Math.pow(2, this.RESOLUTION_POW - maxPower) + '';
			duration = this.ALIASED_DURATIONS[duration] || duration;
			
			if (raw === maxTicks * 1.5) {
				maxTicks *= 1.5;
				duration += 'd';
			}
			
			durations.push(duration);
			raw -= maxTicks;
		}
		
		return durations;
	},
	
	/**
	 * Returns the number of ticks represented by the given duration string.
	 * 
	 * This method is similar to Vex.Flow#durationToTicks, but it accepts a
	 * full parseable duration string, rather than a simple notehead duration
	 * (i.e. it allows dotted durations), and it returns a fraction object
	 * rather than a plain integer.
	 * 
	 * @param {String} duration
	 * 
	 * @return {Vex.Flow.Fraction}
	 */
	durationToTicks: function(duration) {
		return new Vex.Flow.Fraction(
			Vex.Flow.parseNoteData(
				Vex.Flow.parseNoteDurationString(duration)
			).ticks,
			1
		);
	},
	
	/**
	 * Returns the key string for a note on the center line of the given
	 * clef, useful for aligning rests on a staff with a particular clef.
	 * 
	 * @param {String} clef
	 * 
	 * @return {String}
	 */
	getMiddleLine: function(clef) {
		var scale = this.NUM_SCALE;
		var lineShift = Vex.Flow.clefProperties(clef).line_shift;
		
		return (
			Vex.Flow.Music.roots[
				// The number 6 here calibrates a line shift of 0 to the note "B".
				6 - (lineShift * 2) % scale
			]
			+ '/'
			+ (
				// The number 4 here calibrates a line shift of 0 to octave 4.
				4 - Math.floor(lineShift * 2 / scale)
			)
		);
	}
});
/**
 * Modeled off of Vex.Flow.KeyManager, this class provides key and accidental management
 * that is octave-aware and more streamlined than the original implementation.
 */
Ext.define('Tutti.KeyManager', {
	
	config: {
		key: null
	},
	
	/**
	 * @private
	 * @property {Object}
	 * 
	 * An object containing current accidental maps by octave.
	 */
	current: null,
	
	constructor: function(config) {
		this.initConfig(config);
		this.reset();
	},
	
	updateKey: function(key) {
		this.scale = Tutti.Theory.getScaleToneAccidentals(key);
	},
	
	reset: function() {
		this.current = {};
		this.recent = Ext.clone(this.scale);
	},
	
	getCurrent: function(octave) {
		var all = this.current;
		var current = all[octave];
		
		if (!current) {
			current = all[octave] = Ext.clone(this.scale);
		}
		
		return current;
	},
	
	selectAccidental: function(note) {
		var parts = Tutti.Theory.getNoteParts(note);
		
		var root = parts.root;
		var accidental = parts.accidental || 'n';
		
		var current = this.getCurrent(parts.octave);
		var recent = this.recent;
		
		if (accidental !== current[root] || accidental !== recent[root]) {
			return current[root] = recent[root] = accidental;
		}
		else {
			return null;
		}
	}
});
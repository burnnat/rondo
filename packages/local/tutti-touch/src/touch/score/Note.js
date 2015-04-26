/**
 * 
 */
Ext.define('Tutti.touch.score.Note', {
	extend: 'Tutti.touch.BlockItem',
	
	mixins: {
		active: 'Tutti.touch.Activatable'
	},
	
	uses: [
		'Tutti.Util',
		'Tutti.Theory',
		'Vex.Flow.Accidental',
		'Vex.Flow.StaveNote'
	],
	
	isNote: true,
	
	precedence: 20,
	selectable: true,
	
	config: {
		voice: null,
		data: null
	},
	
	/**
	 * @param {Vex.Flow.Voice} voice
	 * @param {Number} [index]
	 */
	registerWithVoice: function(voice, index) {
		var data = this.getData();
		var clef = voice.stave.clef;
		var rest = data.get('rest');
		
		this.primitive = new Vex.Flow.StaveNote({
			keys: rest
				? ['r/4']
				: data.get('pitches'),
			duration: data.get('duration') + (rest ? 'r' : ''),
			clef: clef
		});
		
		voice.addTickable(this.primitive);
		
		if (Ext.isDefined(index)) {
			var tickables = voice.tickables;
			Tutti.Util.move(tickables, tickables.length - 1, index);
		}
	},
	
	/**
	 * @param {Vex.Flow.Voice} voice
	 */
	deregisterWithVoice: function(voice) {
		var primitive = this.primitive;
		
		voice.ticksUsed.subtract(primitive.getTicks());
		Ext.Array.remove(voice.tickables, primitive);
		
		delete this.primitive;
	},
	
	/**
	 * 
	 */
	reregister: function() {
		var primitive = this.primitive;
		var voice = primitive.getVoice();
		
		var index = Ext.Array.indexOf(voice.tickables, primitive);
		
		this.deregisterWithVoice(voice);
		this.registerWithVoice(voice, index);
	},
	
	/**
	 * @return {Object}
	 */
	getDuration: function() {
		return Vex.Flow.parseNoteDurationString(this.getData().get('duration'));
	},
	
	/**
	 * @private
	 * @param {Ext.Class} type
	 */
	clearModifiers: function(type) {
		var primitive = this.primitive;
		
		primitive.modifiers = Ext.Array.filter(
			primitive.modifiers,
			function(modifier) {
				return !(modifier instanceof type);
			}
		);
	},
	
	/**
	 * 
	 */
	clearAccidentals: function() {
		this.clearModifiers(Vex.Flow.Accidental);
	},
	
	/**
	 * @param {Number} index
	 * @param {String} type
	 */
	addAccidental: function(index, type) {
		this.primitive.addAccidental(index, new Vex.Flow.Accidental(type));
	},
	
	/**
	 * 
	 */
	clearDots: function() {
		this.clearModifiers(Vex.Flow.Dot);
	},
	
	/**
	 * 
	 */
	addDot: function() {
		this.primitive.addDotToAll();
	},
	
	/**
	 * @param {Function} fn
	 * @param {String} fn.pitch
	 * @param {Number} fn.index
	 * @param {Number} fn.length
	 * 
	 * @param {Object} scope
	 */
	eachPitch: function(fn, scope) {
		if (this.getData().get('rest')) {
			return;
		}
		
		var pitches = this.primitive.keys;
		var length = pitches.length;
		
		for (var i = 0; i < length; i++) {
			if (fn.call(scope || this, pitches[i], i, length) === false) {
				break;
			}
		}
	},
	
	/**
	 * @param {Number} index
	 * 
	 * @return {Boolean}
	 */
	isTied: function(index) {
		return !!Ext.Array.from(this.getData().get('ties'))[index];
	},
	
	updateLayout: function(voice) {
		this.primitive.setStave(voice.stave);
	},
	
	draw: function(context) {
		var primitive = this.primitive;
		
		primitive.setContext(context);
		primitive.draw(context);
	},
	
	getBoundingBox: function() {
		return this.primitive.getBoundingBox();
	},
	
	getX: function() {
		return this.primitive.getAbsoluteX();
	},
	
	getHeadWidth: function() {
		return this.primitive.glyph.head_width;
	},
	
	/**
	 * @return {Boolean}
	 */
	isStemUp: function() {
		return this.primitive.stem_direction > 0;
	}
});
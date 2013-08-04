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
	
	precedence: 20,
	selectable: true,
	
	config: {
		voice: null,
		data: null
	},
	
	registerWithVoice: function(voice, index) {
		var data = this.getData();
		
		this.primitive = new Vex.Flow.StaveNote({
			keys: data.getPitchData(),
			duration: data.get('duration'),
			clef: voice.stave.clef
		});
		
		voice.addTickable(this.primitive);
		
		if (Ext.isDefined(index)) {
			var tickables = voice.tickables;
			Tutti.Util.move(tickables, tickables.length - 1, index);
		}
	},
	
	deregisterWithVoice: function(voice) {
		var primitive = this.primitive;
		
		voice.ticksUsed.subtract(primitive.getTicks());
		Ext.Array.remove(voice.tickables, primitive);
		
		delete this.primitive;
	},
	
	reregister: function() {
		var primitive = this.primitive;
		var voice = primitive.getVoice();
		
		var index = Ext.Array.indexOf(voice.tickables, primitive);
		
		this.deregisterWithVoice(voice);
		this.registerWithVoice(voice, index);
	},
	
	clearAccidentals: function() {
		var primitive = this.primitive;
		
		primitive.modifiers = Ext.Array.filter(
			primitive.modifiers,
			function(modifier) {
				return !(modifier instanceof Vex.Flow.Accidental);
			}
		);
	},
	
	addAccidental: function(index, type) {
		this.primitive.addAccidental(index, new Vex.Flow.Accidental(type));
	},
	
	eachPitch: function(fn, scope) {
		var pitches = this.primitive.keys;
		var length = pitches.length;
		
		for (var i = 0; i < length; i++) {
			if (fn.call(scope || this, pitches[i], i, length) === false) {
				break;
			}
		}
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
	}
});
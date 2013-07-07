/**
 * 
 */
Ext.define('Tutti.touch.score.Note', {
	extend: 'Tutti.touch.BlockItem',
	
	mixins: {
		observable: 'Ext.mixin.Observable'
	},
	
	precedence: 20,
	selectable: true,
	
	config: {
		voice: null,
		data: null,
		
		active: false
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
	
	updateLayout: function(voice) {
		this.primitive.setStave(voice.stave);
	},
	
	draw: function(context) {
		var primitive = this.primitive;
		
		primitive.setContext(context);
		
		this.saveContext(context, ['fillStyle']);
		
		if (this.getActive()) {
			context.fillStyle = 'magenta';
		}
		
		primitive.draw(context);
		
		this.restoreContext(context);
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
	
	updateActive: function() {
		this.fireEvent('refresh', { repaint: true });
	}
});
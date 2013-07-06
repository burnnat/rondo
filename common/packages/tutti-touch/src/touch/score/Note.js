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
	
	registerWithVoice: function(voice) {
		var data = this.getData();
		
		this.primitive = new Vex.Flow.StaveNote({
			keys: data.getPitchData(),
			duration: data.get('duration'),
			clef: voice.stave.clef
		});
		
		voice.addTickable(this.primitive);
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
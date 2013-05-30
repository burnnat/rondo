/**
 * 
 */
Ext.define('Tutti.touch.Tickable', {
	extend: 'Tutti.touch.BlockItem',
	
	config: {
		voiceId: null,
		tickIndex: null,
		delegate: null,
		staff: null,
		selected: false
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.id = Ext.data.identifier.Uuid.Global.generate(this);
		
		this.getDelegate().setStave(this.getStaff());
	},
	
	getId: function() {
		return this.id;
	},
	
	getBoundingBox: function() {
		return this.getDelegate().getBoundingBox();
	},
	
	draw: function(context) {
		var originalFill = context.fillStyle;
		var originalStroke = context.strokeStyle;
		
		if (this.getSelected()) {
			context.fillStyle = 'magenta';
			context.strokeStyle = 'magenta';
		}
		
		var tickable = this.getDelegate();
		tickable.setContext(context);
		tickable.draw();
		
		context.fillStyle = originalFill;
		context.strokeStyle = originalStroke;
	}
});
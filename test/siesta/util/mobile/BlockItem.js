/**
 * 
 */
Ext.define('Test.BlockItem', {
	extend: 'Tutti.touch.BlockItem',
	
	selectable: true,
	
	config: {
		color: null,
		x: 0,
		y: 0,
		width: 0,
		height: 0
	},
	
	constructor: function(config) {
		Ext.copyTo(this, config, ['selectable', 'precedence']);
		this.callParent(arguments);
	},
	
	draw: function(context) {
		context.fillStyle = this.getColor();
		context.fillRect(
			this.getX(),
			this.getY(),
			this.getWidth(),
			this.getHeight()
		);
	},
	
	getBoundingBox: function() {
		return {
			x: this.getX(),
			y: this.getY(),
			w: this.getWidth(),
			h: this.getHeight()
		};
	}
});
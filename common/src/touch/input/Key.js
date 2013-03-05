/**
 * 
 */
Ext.define('Tutti.touch.input.Key', {
	
	precedence: 0,
	
	config: {
		type: 'white',
		x: null,
		width: null,
		height: null,
		
		pitch: null,
		last: false,
		active: false
	},
	
	constructor: function(config) {
		this.initConfig(config);
	},
	
	getId: function() {
		return this.getPitch();
	},
	
	getBoundingBox: function() {
		return {
			x: this.getX(),
			y: 0,
			w: this.getWidth(),
			h: this.getHeight()
		};
	},
	
	draw: function(context) {
		var x = this.getX();
		var width = this.getWidth();
		var height = this.getHeight();
		
		context.fillStyle = this.getActive() ? '#FFFF88' : this.getType();
		context.strokeStyle = 'black';
		context.lineWidth = 1;
		
		context.fillRect(x, 0, width, height);
		context.strokeRect(
			x + 0.5,
			0.5,
			width - 1,
			height - 1
		);
		
		// Middle C
		if (this.getPitch() == 60) {
			context.fillStyle = 'red';
			context.strokeStyle = 'darkred';
			context.lineWidth = 3;
			
			context.beginPath();
			context.arc(
				x + width / 2,
				height - width / 2,
				width / 5,
				0,
				2 * Math.PI,
				false
			);
			context.fill();
			context.stroke();
		}
	},
	
	updateType: function(type) {
		this.precedence = type == 'black' ? 1 : 0;
	},
	
	getPageBox: function() {
		var xy = this.parent.getXY();
		var bounds = this.getBoundingBox()
		
		var x = xy[0] + bounds.x;
		var y = xy[1] + bounds.y;
		
		return {
			left: x,
			right: x + bounds.w,
			top: y,
			bottom: y + bounds.h,
			width: bounds.w,
			height: bounds.h
		};
	}
});
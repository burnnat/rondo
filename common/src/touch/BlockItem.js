/**
 * 
 */
Ext.define('Tutti.touch.BlockItem', {
	
	precedence: 0,
	
	constructor: function(config) {
		this.initConfig(config);
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
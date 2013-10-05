/**
 * 
 */
Ext.define('Tutti.touch.BlockItem', {
	
	precedence: 0,
	selectable: false,
	
	constructor: function(config) {
		this.initConfig(config);
		this.savedContext = [];
	},
	
	/**
	 * @param {RenderingContext} context
	 */
	draw: Ext.emptyFn,
	
	saveContext: function(context, props) {
		this.savedContext.push(Ext.copyTo({}, context, props));
	},
	
	restoreContext: function(context) {
		Ext.apply(context, this.savedContext.pop());
	},
	
	getPageBox: function() {
		var bounds = this.getBoundingBox();
		
		var parent = this.parent;
		var xy = parent.canvasEl.getXY();
		var scale = parent.getScale();
		
		var x = xy[0] + bounds.x * scale;
		var y = xy[1] + bounds.y * scale;
		
		var width = bounds.w * scale;
		var height = bounds.h * scale;
		
		return {
			left: x,
			right: x + width,
			top: y,
			bottom: y + height,
			width: width,
			height: height
		};
	}
});
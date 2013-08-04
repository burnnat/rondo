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
		var xy = this.parent.canvasEl.getXY();
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
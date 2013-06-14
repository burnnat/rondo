/**
 * 
 */
Ext.define('Tutti.touch.score.Barline', {
	extend: 'Tutti.touch.BlockItem',
	
	config: {
		topStaff: null,
		bottomStaff: null
	},
	
	draw: function(context) {
		var top = this.getTopStaff();
		var bottom = this.getBottomStaff();
		
		var x = top.getX() + top.getWidth() - 1;
		var y = top.getStaffTop();
		
		var height = bottom.getStaffBottom() - y + 1;
		
		context.fillRect(x - 5, y, 1, height);
		context.fillRect(x - 2, y, 3, height);
	}
});
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
		
		var x = top.getX() + top.width - 1;
		var y = top.getYForLine(0);
		
		var height = bottom.getYForLine(bottom.getNumLines() - 1) - y + 1;
		
		context.fillRect(x - 5, y, 1, height);
		context.fillRect(x - 2, y, 3, height);
	}
});